from django.db import models


class Tenant(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class SourceFile(models.Model):
    SOURCE_CHOICES = [
        ('sap', 'SAP'),
        ('utility', 'Utility'),
        ('travel', 'Travel'),
    ]
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    source_type = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    filename = models.CharField(max_length=512)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.source_type})"


class RawRow(models.Model):
    source_file = models.ForeignKey(SourceFile, on_delete=models.CASCADE)
    row_index = models.IntegerField()
    data = models.JSONField()


class NormalizedRow(models.Model):
    STATUS = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')]

    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    source_file = models.ForeignKey(SourceFile, on_delete=models.SET_NULL, null=True)
    raw_row = models.ForeignKey(RawRow, on_delete=models.SET_NULL, null=True)
    source_type = models.CharField(max_length=30)
    normalized = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    received_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.CharField(max_length=200, null=True, blank=True)


class AuditLog(models.Model):
    object_type = models.CharField(max_length=100)
    object_id = models.IntegerField()
    action = models.CharField(max_length=50)
    actor = models.CharField(max_length=200, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(null=True, blank=True)
