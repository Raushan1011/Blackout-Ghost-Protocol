const MOCK_SECTORS = [
    { id: "sector_1", name: "Sector 1: Campus Buzz", nodes: Math.floor(Math.random() * 50) + 12 },
    { id: "sector_2", name: "Sector 2: Tech Vent", nodes: Math.floor(Math.random() * 30) + 5 },
    { id: "sector_3", name: "Sector 3: Late Night Study", nodes: Math.floor(Math.random() * 80) + 20 },
    { id: "sector_4", name: "Sector 4: Deep Void", nodes: Math.floor(Math.random() * 10) + 2 }
];

const SCIFI_NAMES = [
    "Cipher_99", "Neon_Ghost", "Null_Pointer", "Drifter_X", "Echo_State",
    "Phantom_Byte", "Glitch_00", "Hex_Breaker", "Void_Walker", "Static_Pulse",
    "Net_Runner", "Cyber_Ghost", "Subspace_Entity", "Proxy_Seven"
];

const MOCK_MESSAGES = {
    "sector_1": [
        { author: "Neon_Ghost", text: "anybody else totally exhausted after finals?", time: "22:15:34" },
        { author: "Void_Walker", text: "barely surviving on 3 hours of sleep.", time: "22:16:01" }
    ],
    "sector_2": [
        { author: "Cipher_99", text: "my root proxy just got burned. need a new config.", time: "20:01:12" },
        { author: "Null_Pointer", text: "check the encrypted drops. sector 4 has fresh nodes.", time: "20:04:45" }
    ],
    "sector_3": [
        { author: "Echo_State", text: "lofi tracks and physics homework...", time: "01:23:05" },
        { author: "Static_Pulse", text: "math here. someone end my suffering.", time: "01:25:22" }
    ],
    "sector_4": [
        { author: "Drifter_X", text: "it's quiet here. just listening to the grid hum.", time: "04:44:44" }
    ]
};
