// src/data/rooms.js

export const rooms = [
  {
    id: 'deluxe-double-bed',
    name: "Deluxe Double Bed Room",
    price: 1200,
    image: "https://res.cloudinary.com/dgcdngt04/image/upload/q_10,f_auto,w_300/v1735288533/deluxe_double_bed_2nd_rkdilc.jpg",
    description: "Experience comfort and elegance in our Deluxe Double Bed Room, featuring a spacious double bed, modern amenities, stylish interiors, and a serene ambiance—perfect for a relaxing stay",
    amenities: [
      { name: "High-speed Wi-Fi", icon: "📶" },
      { name: "Flat-screen TV", icon: "📺" },
      { name: "Private Bathroom and Rain Shower", icon: "🚿" },
      { name: "Work Desk", icon: "💻" }
    ],
    maxGuests:3 ,
    totalRooms: 4,
    gallery: [
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735288533/deluxe_double_bed_2nd_rkdilc.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735288535/deluxe_double_bed_4th_pvtcp1.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735288532/deluxe_double_3rd_vmsnfl.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735288531/deluxe_double_bed_odvrnc.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735288758/deluxe_double_bed_washroom_kuepr8.jpg"
    ]
  },
  {
    id: 'premium-double-bed',
    name: "Premium Double Bed Room",
    price: 1600,
    image: "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735289485/20241221_175226_pjtexs.jpg",
    description: "Stay in style with our Premium Double Bed Room, offering a spacious layout, modern design, premium amenities, and unmatched comfort for a luxurious experience.",
    amenities: [
      { name: "High-speed Wi-Fi", icon: "📶" },
      { name: "Large Flat-screen TV", icon: "📺" },
      { name: "Private Bathroom and Rain Shower ", icon: "🛁" },
      { name: "Work Desk", icon: "💻" },
      { name: "Hot-Water/Coffee Kettle", icon: "☕" },
    ],
    maxGuests: 3,
    totalRooms: 1,
    gallery: [
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735289485/20241221_175226_pjtexs.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735289488/premiu_sh5hyd.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735289481/20241221_175345_k7q5il.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735289480/20241221_175253_kt8yh6.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735289483/20241221_175451_lc1vsa.jpg"
    ]
  },
  {
    id: 'deluxe-four-bed',
    name: "Deluxe Four Bed Room",
    price: 1800,
    image: "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290068/20241221_174525_pquo5i.jpg",
    description: "Spacious room with four comfortable beds, ideal for families or groups of friends.",
    amenities: [
      { name: "Air Conditioning", icon: "❄" },
      { name: "High-speed Wi-Fi", icon: "📶" },
      { name: "Flat-screen TV", icon: "📺" },
      { name: "Private Bathroom and Rain Shower", icon: "🚿" },
      { name: "Work Desk", icon: "💻" }
    ],
    maxGuests: 6,
    totalRooms: 1,
    gallery: [
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290068/20241221_174525_pquo5i.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290073/20241221_174554_c4qcyi.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290075/20241221_174609_fzuiee.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290077/20241221_174636_rhtbbq.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735289876/deluxe_double_bed_washroom_xzxl9s.jpg"
    ]
  },
  {
    id: 'premium-three-bed',
    name: "Premium Triple Bed Room",
    price: 2500,
    image: "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290499/20241221_175629_sxpfez.jpg",
    description: "Discover luxury in our Premium Three-Bed Room, a spacious and modern retreat with stunning city views and beautiful sceneries from the windows—perfect for a comfortable and memorable stay.",
    amenities: [
      { name: "High-speed Wi-Fi", icon: "📶" },
      { name: "Large Flat-screen TV", icon: "📺" },
      { name: "Private Bathroom and Rain Shower", icon: "🛁" },
      { name: "Hot-Water/Coffee Kettle", icon: "☕" },
      { name: "Work Desk", icon: "💻" },
      { name: "Balcony" }
    ],
    maxGuests: 4,
    totalRooms: 2,
    gallery: [
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290499/20241221_175629_sxpfez.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290504/20241221_175743_skatnf.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290501/20241221_175645_eedlsa.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290508/20241221_175848_zgekhw.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290515/20241221_175910_wzjgko.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735290497/20241221_175451_obfujn.jpg"
    ]
  },
  {
    id: 'luxury-three-bed',
    name: "Luxury Triple Bed Room",
    price: 3600,
    image: "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291051/20241221_172904_n79o14.jpg",
    description: "Indulge in our Luxury Three-Bedroom suite, offering spacious modern interiors, stunning city views, beautiful sceneries from large windows, and a private balcony for a truly luxurious stay.",
    amenities: [
      { name: "Air Conditioning", icon: "❄" },
      { name: "Private Balcony", icon: " " },
      { name: "High-speed Wi-Fi", icon: "📶" },
      { name: "Private Bathroom and Rain Shower", icon: "🛁" },
      { name: "Flat-screen TV", icon: "📺" },
      { name: "Hot-Water/Coffee Kettle", icon: "☕" },
      { name: "Work Desk", icon: "💻" }
    ],
    maxGuests: 4,
    totalRooms: 1,
    gallery: [
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291051/20241221_172904_n79o14.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291047/20241221_172828_xirq3i.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291056/20241221_172930_fzwq2w.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291059/20241221_173039_mfg0xz.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291044/20241221_173733_nksrr3.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291112/20241221_173253_d8rivx.jpg",
      "https://res.cloudinary.com/dgcdngt04/image/upload/f_auto,w_500/v1735291042/WhatsApp_Image_2024-12-27_at_14.45.30_5786b3e6_evulm8.jpg"
    ]
  }
];