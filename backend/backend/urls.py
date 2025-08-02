from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone
from django.db import connection
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

def home_view(request):
    """Simple home view that returns JSON response"""
    return JsonResponse({
        'status': 'ok',
        'message': 'Backend is running',
        'timestamp': timezone.now().isoformat()
    })

def health_check(request):
    """Comprehensive health check endpoint that tests database and other services"""
    health_status = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'service': 'backend',
        'checks': {}
    }
    
    overall_healthy = True
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        health_status['checks']['database'] = {
            'status': 'healthy',
            'message': 'Database connection successful'
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status['checks']['database'] = {
            'status': 'unhealthy',
            'message': f'Database connection failed: {str(e)}'
        }
        overall_healthy = False
    
    try:
        cache_key = 'health_check_test'
        cache.set(cache_key, 'test_value', 60)
        cached_value = cache.get(cache_key)
        if cached_value == 'test_value':
            health_status['checks']['cache'] = {
                'status': 'healthy',
                'message': 'Cache is working'
            }
        else:
            health_status['checks']['cache'] = {
                'status': 'degraded',
                'message': 'Cache set/get mismatch'
            }
    except Exception as e:
        logger.warning(f"Cache health check failed: {e}")
        health_status['checks']['cache'] = {
            'status': 'unavailable',
            'message': f'Cache not available: {str(e)}'
        }
    
    try:
        db_info = connection.get_connection_params()
        health_status['checks']['database_info'] = {
            'engine': connection.settings_dict.get('ENGINE', 'unknown'),
            'name': connection.settings_dict.get('NAME', 'unknown')
        }
    except Exception as e:
        logger.warning(f"Could not get database info: {e}")
    
    if not overall_healthy:
        health_status['status'] = 'unhealthy'
        return JsonResponse(health_status, status=503)  
    
    return JsonResponse(health_status, status=200)

urlpatterns = [
    path('', home_view, name='home'),
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls'))
]