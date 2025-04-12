
from django.contrib import admin
from .models import QuoteRequest,AddonOption

@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ['firstname', 'lastname', 'email', 'phone', 'frequency', 'squarefeet', 'bedroom', 'bathroom', 'created_at']
    search_fields = ['firstname', 'lastname', 'email', 'phone']
    list_filter = ['frequency', 'bedroom', 'bathroom', 'created_at']

@admin.register(AddonOption)
class AddonOptionAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]

    search_fields = ['name']

