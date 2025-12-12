
from flask import Blueprint, request, jsonify, session
from app.main import app
from app.auth import generate_otp, send_otp_email, store_otp, verify_otp, cleanup_expired_otps
from app.tif_extractor import extract_tif_to_json, get_available_years, get_tif_file_path
from app.insights_service import get_insights
from app.anomaly_service import detect_anomalies
from app.growth_analysis_service import analyze_growth
from app.comparison_service import compare_years
import re
import os

# Create blueprint for auth routes
auth_bp = Blueprint('auth', __name__)

# Create blueprint for data routes
data_bp = Blueprint('data', __name__)

# Create blueprint for insights routes
insights_bp = Blueprint('insights', __name__)

# Create blueprint for analysis routes
analysis_bp = Blueprint('analysis', __name__)

# Path to raw data directory
RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'raw', 'NightLights_Bright_Tamil Nadu')


def is_valid_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@auth_bp.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    """Send OTP to user's email"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        # Validate email
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Cleanup expired OTPs
        cleanup_expired_otps()
        
        # Generate OTP
        otp = generate_otp(6)
        
        # Store OTP
        store_otp(email, otp)
        
        # Send email
        email_sent = send_otp_email(email, otp)
        
        if email_sent:
            return jsonify({
                'success': True,
                'message': 'OTP sent successfully to your email'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to send OTP. Please check email configuration or try again later.'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@auth_bp.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp_route():
    """Verify OTP and create session"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        # Validate input
        if not email or not otp:
            return jsonify({'success': False, 'message': 'Email and OTP are required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Verify OTP
        is_valid, message = verify_otp(email, otp)
        
        if is_valid:
            # Create session
            session['user_email'] = email
            session['authenticated'] = True
            session.permanent = True
            
            return jsonify({
                'success': True,
                'message': message,
                'user': {
                    'email': email
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@auth_bp.route('/api/auth/check-session', methods=['GET'])
def check_session():
    """Check if user is authenticated"""
    try:
        if session.get('authenticated') and session.get('user_email'):
            return jsonify({
                'success': True,
                'authenticated': True,
                'user': {
                    'email': session.get('user_email')
                }
            }), 200
        else:
            return jsonify({
                'success': True,
                'authenticated': False
            }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    try:
        session.clear()
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@data_bp.route('/api/data/nightlights/<int:year>', methods=['GET'])
def get_nightlights_data(year):
    """Get nightlights data for a specific year"""
    try:
        # Get sample rate from query parameter (default: 10 for performance)
        sample_rate = int(request.args.get('sample_rate', 10))
        
        # Validate sample rate
        if sample_rate < 1 or sample_rate > 100:
            sample_rate = 10
        
        # Get TIF file path for the year
        tif_path = get_tif_file_path(year, RAW_DATA_DIR)
        
        if not tif_path:
            return jsonify({
                'success': False,
                'message': f'No data found for year {year}'
            }), 404
        
        # Extract data to JSON
        data = extract_tif_to_json(tif_path, sample_rate=sample_rate)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except FileNotFoundError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@data_bp.route('/api/data/available-years', methods=['GET'])
def get_available_years_route():
    """Get list of available years with nightlights data"""
    try:
        years = get_available_years(RAW_DATA_DIR)
        
        return jsonify({
            'success': True,
            'years': years
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@insights_bp.route('/api/insights', methods=['GET'])
def get_insights_route():
    """Get insights for a region and year"""
    try:
        region = request.args.get('region', '').strip()
        year = request.args.get('year', type=int)
        max_results = request.args.get('max_results', type=int, default=5)
        
        # Validate inputs
        if not region:
            return jsonify({
                'success': False,
                'message': 'Region parameter is required'
            }), 400
        
        if not year:
            return jsonify({
                'success': False,
                'message': 'Year parameter is required'
            }), 400
        
        # Validate max_results
        if max_results < 1 or max_results > 10:
            max_results = 5
        
        # Get insights
        result = get_insights(region, year, max_results)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@analysis_bp.route('/api/analysis/anomalies', methods=['GET'])
def get_anomalies_route():
    """Detect anomalies for a region using cleaned data"""
    try:
        region = request.args.get('region', '').strip()
        
        # Validate inputs
        if not region:
            return jsonify({
                'success': False,
                'message': 'Region parameter is required'
            }), 400
        
        # Detect anomalies (uses last available year automatically)
        result = detect_anomalies(region)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@analysis_bp.route('/api/analysis/available-regions', methods=['GET'])
def get_available_regions_route():
    """Get list of available regions with cleaned data"""
    try:
        from app.growth_analysis_service import BASE_CLEAN_DIR
        import os
        
        regions = []
        if os.path.exists(BASE_CLEAN_DIR):
            for folder_name in os.listdir(BASE_CLEAN_DIR):
                folder_path = os.path.join(BASE_CLEAN_DIR, folder_name)
                if os.path.isdir(folder_path) and 'nightlights_bright' in folder_name.lower() and 'cleaned' in folder_name.lower():
                    # Extract region name from folder name
                    # Format: NightLights_Bright_RegionName_cleaned
                    parts = folder_name.replace('NightLights_Bright_', '').replace('_cleaned', '').split('_')
                    region_name = ' '.join(parts)
                    regions.append({
                        'name': region_name,
                        'folder': folder_name
                    })
        
        return jsonify({
            'success': True,
            'regions': regions
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@analysis_bp.route('/api/analysis/growth', methods=['GET'])
def get_growth_analysis_route():
    """Analyze growth for a region within a year range"""
    try:
        region = request.args.get('region', '').strip()
        start_year = request.args.get('start_year', type=int)
        end_year = request.args.get('end_year', type=int)
        
        # Validate inputs
        if not region:
            return jsonify({
                'success': False,
                'message': 'Region parameter is required'
            }), 400
        
        if not start_year or not end_year:
            return jsonify({
                'success': False,
                'message': 'start_year and end_year parameters are required'
            }), 400
        
        if start_year > end_year:
            return jsonify({
                'success': False,
                'message': 'start_year must be less than or equal to end_year'
            }), 400
        
        # Analyze growth
        result = analyze_growth(region, start_year, end_year)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            # Return 400 for expected errors (like no data found)
            return jsonify(result), 400
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in growth analysis: {str(e)}")
        print(f"Traceback: {error_trace}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}',
            'error_type': type(e).__name__
        }), 500


@analysis_bp.route('/api/compare', methods=['GET'])
def compare_years_route():
    """Compare two specific years of nightlights data"""
    try:
        region = request.args.get('region', '').strip()
        year1 = request.args.get('year1', type=int)
        year2 = request.args.get('year2', type=int)
        
        # Validate inputs
        if not region:
            return jsonify({
                'success': False,
                'message': 'Region parameter is required'
            }), 400
        
        if not year1 or not year2:
            return jsonify({
                'success': False,
                'message': 'year1 and year2 parameters are required'
            }), 400
        
        if year1 == year2:
            return jsonify({
                'success': False,
                'message': 'year1 and year2 must be different'
            }), 400
        
        # Compare years
        result = compare_years(region, year1, year2)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in comparison: {str(e)}")
        print(f"Traceback: {error_trace}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}',
            'error_type': type(e).__name__
        }), 500


# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(data_bp)
app.register_blueprint(insights_bp)
app.register_blueprint(analysis_bp)