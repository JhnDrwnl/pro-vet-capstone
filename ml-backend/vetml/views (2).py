from django.http import HttpResponse
from django.shortcuts import redirect

def homepage(request):
    """
    Simple homepage that redirects to the admin site
    """
    html = """
    <html>
        <head>
            <title>Pet Disease Prediction API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                }
                .endpoints {
                    background-color: #f4f4f4;
                    padding: 15px;
                    border-radius: 5px;
                }
                a {
                    display: inline-block;
                    margin: 10px 0;
                    padding: 8px 16px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                }
                a:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <h1>Pet Disease Prediction System</h1>
            <p>Welcome to the Pet Disease Prediction API. This system uses machine learning to predict potential diseases in pets based on their symptoms.</p>
            
            <h2>Available Endpoints:</h2>
            <div class="endpoints">
                <p><strong>Admin Interface:</strong> /admin/</p>
                <p><strong>Pet API:</strong> /api/pets/</p>
                <p><strong>Predictions API:</strong> /api/predictions/</p>
            </div>
            
            <a href="/admin/">Go to Admin Interface</a>
            <a href="/api/pets/pets/">View Pets API</a>
            <a href="/api/predictions/predictions/">View Predictions API</a>
        </body>
    </html>
    """
    return HttpResponse(html)