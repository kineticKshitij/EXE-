"""
Custom middleware for handling CORS and Private Network Access
"""

class PrivateNetworkAccessMiddleware:
    """
    Middleware to handle Chrome's Private Network Access requirements.
    This adds the necessary headers for cross-origin requests from public to private networks.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = self.get_response(request)
            
            # Add Private Network Access headers
            origin = request.headers.get('Origin', '')
            if origin:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Accept, Authorization, Content-Type, Origin, X-Requested-With'
                response['Access-Control-Max-Age'] = '86400'
                
                # Critical: Allow private network access
                if request.headers.get('Access-Control-Request-Private-Network'):
                    response['Access-Control-Allow-Private-Network'] = 'true'
            
            return response
        
        # Handle regular requests
        response = self.get_response(request)
        
        # Add CORS headers to all responses
        origin = request.headers.get('Origin', '')
        if origin:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            
            # Allow private network access
            if request.headers.get('Access-Control-Request-Private-Network'):
                response['Access-Control-Allow-Private-Network'] = 'true'
        
        return response
