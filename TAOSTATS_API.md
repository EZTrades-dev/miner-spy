# TaoStats API Documentation

## Authentication
- API Key: `tao-83b527cc-6c10-43c3-b205-1146bf0d60fb:16de6f80`
- Rate Limit: 5 calls per minute
- Header: `Authorization: Bearer {API_KEY}`

## Base URL
```
https://api.taostats.io/api
```

## Key Endpoints

### 1. Get Subnets
```
GET /subnet/latest/v1
```
**Parameters:**
- `netuid` (int32, optional): Subnet ID
- `page` (int32): Page number 
- `limit` (int32): Number of responses (max 200)
- `order` (string): `netuid_asc` or `netuid_desc`

**Response Structure:**
```json
{
  "pagination": {
    "current_page": 1,
    "per_page": 50, 
    "total_items": 32,
    "total_pages": 1,
    "next_page": null,
    "prev_page": null
  },
  "data": [
    {
      "block_number": 5453828,
      "timestamp": "2025-04-28T23:59:12Z",
      "netuid": 8,
      "owner": {
        "ss58": "5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM",
        "hex": "0x..."
      },
      "registration_block_number": null,
      "registration_timestamp": "2023-03-20T18:47:48Z",
      "registration_cost": "0",
      "neuron_registration_cost": "500000",
      "max_neurons": 64,
      "active_keys": 64,
      "validators": 8,
      "active_validators": 8,
      "active_miners": 34,
      "active_dual": 4,
      "modality": 0,
      "pow_registration_allowed": false,
      "emission": "0",
      "tempo": 100,
      "difficulty": "0.24999999999999999996",
      "max_validators": 64
    }
  ]
}
```

### 2. Get Metagraph (Neurons/Miners)
```
GET /metagraph/latest/v1
```
**Parameters:**
- `netuid` (int32, required): Subnet ID
- `search` (string): Search across UID, hotkey, coldkey, axon_ip
- `uid` (int32): Specific neuron ID
- `active` (boolean): Filter active neurons
- `hotkey` (string): SS58 or hex format
- `coldkey` (string): SS58 or hex format  
- `validator_permit` (boolean): Has validator permit?
- `is_immunity_period` (boolean): In immunity?
- `is_child_key` (boolean): Is parent hotkey?
- `page` (int32): Page number
- `limit` (int32): Number of responses (max 200)

**Response Structure:**
```json
{
  "pagination": {
    "current_page": 1,
    "per_page": 50,
    "total_items": 156,
    "total_pages": 4,
    "next_page": 2,
    "prev_page": null
  },
  "data": [
    {
      "hotkey": {
        "ss58": "5CAQhe9pWMe9anWX9qbK6Z9RydRth7S6WDopapSr6uShGum5",
        "hex": "0x0459b8ac46933d4cbbd4f0b36934704e7a726851b359ca2ee8d5e704a8896e02"
      },
      "coldkey": {
        "ss58": "5F4kLq8YVzHYj8uv41BUB9ocqTGxAJECeDbYfcqJFKqAhSMj", 
        "hex": "0x84bd11456ecf5f3abcfc983232f3fb2d97bcd2cf05657852774d15a1cea2f366"
      },
      "netuid": 8,
      "uid": 142,
      "block_number": 5453670,
      "timestamp": "2025-04-28T23:27:36Z",
      "stake": "0",
      "trust": "0",
      "validator_trust": "0.98783855954833295186",
      "consensus": "0",
      "incentive": "0", 
      "dividends": "0.25934233615625238422",
      "emission": "38386670943",
      "active": true,
      "validator_permit": true,
      "updated": 71,
      "daily_reward": "767733418860",
      "registered_at_block": 4112860,
      "is_immunity_period": false,
      "rank": 1,
      "is_child_key": true,
      "axon": {
        "ip": "192.168.1.1",
        "port": 8091,
        "ip_type": 4,
        "protocol": 4
      },
      "root_weight": "0.17999999999999999996",
      "alpha_stake": "192498557725397",
      "root_stake": "1209153325609965",
      "total_alpha_stake": "410146156335191.74000000000000"
    }
  ]
}
```

### 3. Get Price Data
```
GET /price/latest/v1?asset=tao
```

**Response Structure:**
```json
{
  "pagination": {...},
  "data": [
    {
      "created_at": "2025-04-28T00:59:00Z",
      "updated_at": "2025-04-28T00:59:00Z", 
      "name": "Bittensor",
      "symbol": "TAO",
      "slug": "bittensor",
      "circulating_supply": "7164363.38746643",
      "max_supply": "21000000",
      "total_supply": "21000000",
      "last_updated": "2025-04-28T00:59:00Z",
      "price": "379.28",
      "volume_24h": "245782156.1234",
      "market_cap": "2717345678.90",
      "percent_change_1h": "-0.45",
      "percent_change_24h": "2.34",
      "percent_change_7d": "-5.67",
      "percent_change_30d": "15.23"
    }
  ]
}
```

## Important Notes

1. **Rate Limiting**: Maximum 5 calls per minute for free tier
2. **Authentication**: Use Bearer token in Authorization header
3. **Pagination**: All endpoints support pagination
4. **Filtering**: Metagraph endpoint supports extensive filtering
5. **Data Freshness**: "latest" endpoints provide most recent data
6. **Error Handling**: Standard HTTP status codes (200, 400, 401, 429, 500)

## Example Requests

### Get Subnet 8 Info
```bash
curl --request GET \
  --url 'https://api.taostats.io/api/subnet/latest/v1?netuid=8' \
  --header 'Authorization: Bearer tao-83b527cc-6c10-43c3-b205-1146bf0d60fb:16de6f80' \
  --header 'accept: application/json'
```

### Get All Miners for Subnet 8
```bash
curl --request GET \
  --url 'https://api.taostats.io/api/metagraph/latest/v1?netuid=8&limit=200' \
  --header 'Authorization: Bearer tao-83b527cc-6c10-43c3-b205-1146bf0d60fb:16de6f80' \
  --header 'accept: application/json'
```
