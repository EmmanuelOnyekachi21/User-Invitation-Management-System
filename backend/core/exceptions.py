from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import traceback


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        return Response({
            "success": False,
            "message": _get_message(response.data),
            "errors": response.data,
        }, status=response.status_code)

    traceback.print_exc()
    
    # DRF returned None
    return Response({
        "success": False,
        "message": "An unexpected error occurred.",
        "errors": {},
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def _get_message(data):
    # Extract human readable top level message for error data
    if isinstance(data, dict) and "detail" in data:
        return str(data["detail"])
    return "An error occurred"
