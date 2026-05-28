import csv
import io
from dateutil import parser as dateparser
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SourceFile, RawRow, NormalizedRow
from .serializers import NormalizedRowSerializer


UNIT_MAP = {
    'mwh': 1000,
    'kwh': 1,
    'l': 1,
    'ltr': 1,
    'gwh': 1000000,
    'mwh': 1000,
    'kwh': 1,
    'wh': 1/1000,
    'l': 1,
    'ltr': 1,
}


def normalize_row(source_type, row):
    # Very small normalization examples per source type
    out = {}
    if source_type == 'sap':
        # map common fields
        out['date'] = None
        for k, v in row.items():
            lk = k.lower()
            if 'date' in lk:
                try:
                    out['date'] = dateparser.parse(v, dayfirst=True).isoformat()
                except Exception:
                    out['date'] = v
            if lk in ('unit', 'uom'):
                u = v.lower().strip()
                out['unit'] = u
            if lk in ('quantity', 'qty'):
                try:
                    out['quantity'] = float(v.replace(',', ''))
                except Exception:
                    out['quantity'] = v
            if lk in ('plant', 'plant_code'):
                out['plant_code'] = v
        # unit normalization
        if 'unit' in out and 'quantity' in out:
            u = out['unit']
            factor = UNIT_MAP.get(u, 1)
            out['quantity_kwh'] = out['quantity'] * factor

    elif source_type == 'utility':
        out['meter_id'] = row.get('meter_id') or row.get('meter')
        out['start_date'] = row.get('start_date')
        out['end_date'] = row.get('end_date')
        # normalize reading unit
        reading = row.get('reading') or row.get('consumption')
        unit = (row.get('unit') or 'kwh').lower()
        try:
            val = float(reading)
            out['reading_kwh'] = val * UNIT_MAP.get(unit, 1)
        except Exception:
            out['reading_kwh'] = reading

    elif source_type == 'travel':
        out['employee_id'] = row.get('employee_id')
        out['trip_id'] = row.get('trip_id')
        out['from'] = (row.get('departure_airport') or row.get('from') or '').upper()
        out['to'] = (row.get('arrival_airport') or row.get('to') or '').upper()
        # distance: use provided or compute via simple airport coords lookup
        try:
            out['distance_km'] = float(row.get('distance_km')) if row.get('distance_km') else None
        except Exception:
            out['distance_km'] = None

        if not out.get('distance_km') and out.get('from') and out.get('to'):
            # small built-in IATA coords for common airports
            AIRPORT_COORDS = {
                'JFK': (40.6413, -73.7781),
                'LHR': (51.4700, -0.4543),
                'SFO': (37.6213, -122.3790),
                'MUC': (48.3538, 11.7861),
                'FRA': (50.0379, 8.5622),
                'DEL': (28.5562, 77.1000),
            }

            def haversine(lat1, lon1, lat2, lon2):
                from math import radians, sin, cos, asin, sqrt
                lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
                c = 2 * asin(sqrt(a))
                r = 6371
                return c * r

            a = AIRPORT_COORDS.get(out['from'])
            b = AIRPORT_COORDS.get(out['to'])
            if a and b:
                out['distance_km'] = round(haversine(a[0], a[1], b[0], b[1]), 1)

    # Basic suspicious detection rules applied during normalization
    suspicious = False
    try:
        if out.get('reading_kwh') and float(out.get('reading_kwh')) > 10000:
            suspicious = True
    except Exception:
        pass
    try:
        if out.get('quantity_kwh') and float(out.get('quantity_kwh')) > 10000:
            suspicious = True
    except Exception:
        pass
    try:
        if out.get('distance_km') and float(out.get('distance_km')) > 20000:
            suspicious = True
    except Exception:
        pass

    out['suspicious'] = suspicious

    return out


class UploadCSVAPIView(APIView):
    def post(self, request):
        source_type = request.query_params.get('source_type')
        f = request.FILES.get('file')
        if not f or not source_type:
            return Response({'detail': 'file and source_type required'}, status=status.HTTP_400_BAD_REQUEST)

        sf = SourceFile.objects.create(source_type=source_type, filename=f.name)
        text = f.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))
        created = 0
        for idx, row in enumerate(reader):
            raw = RawRow.objects.create(source_file=sf, row_index=idx, data=row)
            norm = normalize_row(source_type, row)
            NormalizedRow.objects.create(source_file=sf, raw_row=raw, source_type=source_type, normalized=norm)
            created += 1

        return Response({'uploaded_rows': created})


class NormalizedRowListAPI(APIView):
    def get(self, request):
        qs = NormalizedRow.objects.all().order_by('-received_at')[:200]
        serializer = NormalizedRowSerializer(qs, many=True)
        return Response(serializer.data)


class ApproveRowAPI(APIView):
    def post(self, request, pk):
        action = request.data.get('action')
        actor = request.data.get('actor', 'analyst')
        try:
            row = NormalizedRow.objects.get(pk=pk)
        except NormalizedRow.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if action == 'approve':
            row.status = 'APPROVED'
            row.approved_at = timezone.now()
            row.approved_by = actor
            row.save()
        elif action == 'reject':
            row.status = 'REJECTED'
            row.approved_at = timezone.now()
            row.approved_by = actor
            row.save()
        else:
            return Response({'detail': 'invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': row.status})
        
