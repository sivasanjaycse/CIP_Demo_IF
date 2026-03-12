from scapy.all import sniff, dev_from_index

# Force Scapy to use your active Wi-Fi adapter (Index 17)
wifi_interface = dev_from_index(17)

print(f"Listening on: {wifi_interface.name}")
print("Go load a webpage real quick!")

try:
    # We pass the specific interface to the sniff function
    packets = sniff(iface=wifi_interface, count=5)
    print(f"\n✅ BOOM! Success! Captured {len(packets)} packets.")
except Exception as e:
    print(f"\n❌ Error: {e}")