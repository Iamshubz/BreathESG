from django.contrib import admin
from .models import Tenant, SourceFile, RawRow, NormalizedRow, AuditLog

admin.site.register(Tenant)
admin.site.register(SourceFile)
admin.site.register(RawRow)
admin.site.register(NormalizedRow)
admin.site.register(AuditLog)
