from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone

def health_check(request):
    try:
        # This will make a simple database query to keep Supabase active
        from django.contrib.auth.models import User
        user_count = User.objects.count()
        
        return JsonResponse({
            "status": "ok",
            "timestamp": timezone.now().isoformat(),
            "database": "connected"
        })
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "error": str(e)
        }, status=500)
    
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('health/', health_check, name='health_check'),
]
