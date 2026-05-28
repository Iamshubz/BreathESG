from rest_framework import serializers
from .models import NormalizedRow


class NormalizedRowSerializer(serializers.ModelSerializer):
    source_file_filename = serializers.SerializerMethodField()
    raw_row_id = serializers.SerializerMethodField()

    class Meta:
        model = NormalizedRow
        fields = ['id', 'tenant', 'source_type', 'normalized', 'status', 'received_at', 'approved_at', 'approved_by', 'source_file_filename', 'raw_row_id']

    def get_source_file_filename(self, obj):
        return obj.source_file.filename if obj.source_file else None

    def get_raw_row_id(self, obj):
        return obj.raw_row.id if obj.raw_row else None
