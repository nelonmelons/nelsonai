# Nelson AI - Hospitality Messaging & Upsell Agent

An AI-powered guest communication automation system for hospitality businesses, powered by Google Gemini AI, designed to maximize revenue through intelligent upselling while providing exceptional guest experiences.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Environment

Create a `.env` file with your Gemini API key:

```
GEMINI_KEY=your_api_key_here
```

### 3. Launch Dashboard

```bash
# Windows
start_dashboard.bat

# Or manually
python app.py
```

Then open http://localhost:5000 in your browser!

## 🌟 Features

### 1. **🤖 Gemini AI Integration**

- Powered by Google's Gemini 1.5 Flash (cost-effective and fast)
- Natural, context-aware responses
- Multi-language support
- Customizable tone (friendly, casual, formal)
- Smart confidence scoring
- Automatic fallback to templates

### 2. **📊 Interactive Dashboard**

- Real-time messaging inbox
- Live analytics and revenue tracking
- Opportunity management
- Autopilot mode toggle
- Filter by priority, channel, or upsell opportunities
- WebSocket-powered real-time updates

### 3. **Intelligent Message Classification**

- Automatically categorizes guest messages (early check-in, late checkout, amenities, etc.)
- Sentiment analysis (positive, neutral, negative, urgent)
- Priority detection
- Multi-channel support (Airbnb, VRBO, Booking.com, Email, SMS, WhatsApp)

### 4. **Automated Upsell Detection**

- **Reactive Mode**: Identifies upsell opportunities from guest messages
- **Proactive Mode**: Detects opportunities based on booking data
  - Orphan night filling
  - Pre-arrival upsells (3 days, 1 day, check-in day)
  - Special occasion packages
  - Last-minute offers

### 5. **Dynamic Pricing Engine**

- Adjusts prices based on:
  - Occupancy rates
  - Timing (last-minute, early bird)
  - Guest lifetime value
  - Demand patterns
- Configurable min/max price constraints

### 6. **Unified Inbox**

- Manage all guest communications in one place
- Filter by priority, channel, upsell opportunities
- Conversation threading
- Quick search and filtering

### 7. **Analytics & ROI Tracking**

- Revenue tracking by category and trigger
- Conversion rate analysis
- Top performing offers
- Daily revenue reports
- ROI calculations

### 7. **Autopilot Mode**

- Fully automated or human-in-the-loop
- Configurable approval workflows
- Business hours awareness
- Response time tracking

## 🚀 Quick Start

### Installation

```bash
pip install -r requirements.txt
```

### Basic Usage

```python
from besty import BestyAgent
from besty.config import PropertyConfig

# Initialize agent
agent = BestyAgent()

# Configure your property
agent.config.property = PropertyConfig(
    property_id="prop_001",
    property_name="Your Property Name",
    check_in_time="15:00",
    check_out_time="11:00"
)

# Process a guest message
result = agent.process_guest_message(
    guest_id="guest_123",
    guest_name="Sarah Johnson",
    booking_id="book_456",
    channel="airbnb",
    content="Hi! Can we check in early?",
    booking_info={
        "booking_value": 1200,
        "checkin_date": "2025-01-15",
        "checkout_date": "2025-01-18",
        "days_until_checkin": 2,
        "occupancy_rate": 0.75
    }
)

print(result['response'])  # AI-generated response with upsell offer
```

## 📊 Default Upsell Offers

The system comes pre-configured with common hospitality upsells:

1. **Early Check-in** - $25-$100 (dynamic)
2. **Late Check-out** - $25-$100 (dynamic)
3. **Extra Night** - Dynamic pricing with orphan night detection
4. **Room Upgrade** - $50-$200 (dynamic)
5. **Parking** - $30 (fixed)
6. **Breakfast Package** - $25 per person (fixed)
7. **Spa Package** - $100-$250 (dynamic)

## 🎯 Use Cases

### 1. Reactive Upselling

Guest sends a message requesting something → AI detects opportunity → Generates offer → Increases revenue

**Example:**

> Guest: "Can we check in at noon instead of 3 PM?"
>
> Besty AI: "Hi Sarah! We'd be happy to arrange early check-in at 12:00 PM for $50. This ensures your room is ready when you arrive. Should I add this to your booking?"

### 2. Proactive Campaigns

#### Orphan Night Filling

```python
# Automatically detect and fill single-night gaps
campaigns = agent.run_proactive_campaign(bookings)
```

#### Pre-Arrival Offers

- 3 days before: Amenities & upgrades
- 1 day before: Special packages
- Check-in day: Early check-in offers

### 3. Special Occasions

Detect celebrations (birthdays, anniversaries) and offer premium packages automatically.

## 🔧 Configuration

### Basic Configuration

```python
from besty.config import BestyConfig, OperationMode

config = BestyConfig(
    operation_mode=OperationMode.HYBRID,  # proactive, reactive, or hybrid
    auto_pilot=True,  # Enable full automation
    require_approval=False,  # Human review required?
    upsell_enabled=True,
    ai_model="gpt-4",  # AI model for responses
    temperature=0.7
)

agent = BestyAgent(config)
```

### Add Custom Offers

```python
from besty.config import UpsellOffer

custom_offer = UpsellOffer(
    id="airport_shuttle",
    name="Airport Shuttle",
    description="Private airport transfer",
    base_price=75.0,
    category="amenity",
    dynamic_pricing=True,
    min_price=50.0,
    max_price=120.0
)

agent.config.add_offer(custom_offer)
```

## 📱 Multi-Channel Support

Besty AI works across all major hospitality platforms:

- **OTAs**: Airbnb, VRBO, Booking.com
- **Direct**: Email, SMS, WhatsApp
- **Property Management Systems**: Guesty, Hostaway, Streamline, etc.

## 📈 Analytics Dashboard

```python
from besty.analytics import Analytics

analytics = Analytics()

# Get performance metrics
metrics = analytics.get_metrics()
print(f"Conversion Rate: {metrics.conversion_rate}%")
print(f"Total Revenue: ${metrics.total_revenue}")

# Get ROI
roi = analytics.get_roi_summary(monthly_cost=99)
print(f"ROI: {roi['roi_percentage']}%")
```

## 🧪 Run Examples

```bash
python besty/examples.py
```

This will demonstrate:

- Processing guest messages
- Proactive campaigns
- Unified inbox management
- Analytics tracking
- Autopilot mode

## 🏗️ Architecture

```
besty/
├── __init__.py           # Package initialization
├── agent.py              # Main BestyAgent orchestrator
├── config.py             # Configuration and offers
├── message_handler.py    # Message classification
├── upsell_engine.py      # Opportunity detection
├── response_generator.py # AI response generation
├── inbox.py              # Unified inbox
├── analytics.py          # ROI tracking
└── examples.py           # Usage examples
```

## 🎓 Key Concepts

### Message Types

- Early check-in request
- Late checkout request
- Extra night inquiry
- Amenity request
- Upgrade inquiry
- General inquiry
- Complaint
- Directions

### Upsell Triggers

- Guest request (reactive)
- Booking confirmation
- Days before arrival (3 days, 1 day)
- Check-in day
- Orphan night detection
- Special occasion
- During stay

### Operation Modes

- **Proactive**: Agent initiates conversations
- **Reactive**: Agent responds to guest requests
- **Hybrid**: Both proactive and reactive

## 💡 Best Practices

1. **Start with Human Approval**: Enable `require_approval=True` initially
2. **Monitor Performance**: Track conversion rates and adjust pricing
3. **Customize Offers**: Tailor upsells to your property type
4. **Set Business Hours**: Configure when to send proactive messages
5. **Test Responses**: Review AI-generated messages before full automation

## 🔐 Privacy & Data

- No guest data is stored permanently unless you implement persistence
- All processing happens locally
- AI model integration is optional
- GDPR and hospitality compliance ready

## 🛠️ Extending Besty AI

### Add Custom Message Classifiers

```python
from besty.message_handler import MessageHandler, MessageType

handler = MessageHandler()
handler.keywords[MessageType.CUSTOM] = [r"custom_pattern"]
```

### Integrate with PMS

```python
# Connect to your property management system
def sync_bookings_from_pms():
    bookings = fetch_from_guesty()  # or Hostaway, etc.
    return agent.run_proactive_campaign(bookings)
```

### Custom Analytics

```python
analytics = Analytics()
# Track custom metrics
analytics.record_conversion(...)
```

## 📞 Support

For issues, feature requests, or questions, please open an issue on GitHub.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

Inspired by Besty.ai - The #1 AI assistant for hospitality

---

**Built with ❤️ for hospitality professionals**

Transform your guest communications and maximize revenue with intelligent automation!
