import asyncio
from scapy.all import sniff, dev_from_index
import pandas as pd

async def capture_live_traffic(duration_seconds: int = 10) -> tuple[pd.DataFrame, int]:
    """
    Captures live network traffic for the specified duration.
    Returns a mocked DataFrame formatted for the ML pipeline and the total packet count.
    """
    # 1. Grab your specific Wi-Fi adapter (Index 17)
    wifi_interface = dev_from_index(17)
    
    # 2. Run the blocking scapy sniff function in a separate thread using that interface
    packets = await asyncio.to_thread(
        sniff, 
        iface=wifi_interface,
        timeout=duration_seconds
    )
    
    packet_count = len(packets)
    
    # Mocking the feature extraction that would normally happen here
    mock_features = {
        "Flow Duration": [45000],
        "Total Fwd Packets": [packet_count],
        "Fwd Packet Length Max": [1500],
        "Bwd Packet Length Mean": [250.5]
    }
    
    return pd.DataFrame(mock_features), packet_count