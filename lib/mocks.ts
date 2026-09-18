import type { CheckoutSummary } from "@/features/checkout/types/checkout.interface";
import type { Order } from "@/features/orders/types/order.interface";

export const PRODUCT_BY_ID_MOCK = {
  data: {
    product: {
      id: "1",
      name: "Camisa de lino",
      description:
        "Confeccionada en lino orgánico transpirable de primera calidad, esta sobrecamisa está diseñada para combinarse fácilmente con otras prendas. Su corte holgado y su cuello estructurado logran un equilibrio perfecto entre comodidad informal y estilo sofisticado",
      price: 145,
      colors: [
        { name: "Verde oliva", hex: "#54624F" },
        { name: "Gris piedra", hex: "#918E85" },
      ],
      variants: [
        { size: "S", stock: 8 },
        { size: "M", stock: 12 },
        { size: "L", stock: 5 },
        { size: "XL", stock: 0 },
      ],
      images: {
        main: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe8G22N74E_A_vF_DFLb4Pr4WDTtE7F2om8PrfNlWfz5WiX_o5_V6-jurTcLfOXDu_a67jizLGLsqEHAuGkoesszXs4Sc6wdjeHVvSK22IxmA8MJmcoOdR2AVRX1DK1mJDs5V4THnUWKod-MbakZTLqlArzILiTpFKYiISLsFDiiFEsK6n7oUs9eewAVSFrc0ealoxTmYyl1hkLZUshqLAgDcnq8nVfQbspdsTS0rGnSVimYSVlQQs",
        thumbnails: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBd-YsR-XNfNdYYiIB9pddWYzQC4GRRh3DinlyIPQEjXj4Qo5lD3hjDLANrRM_0GaTR_NjueqE0fduw4-W_Po0s9oVjba9rP0-abr2-VthEqyRv2aeSKUAIrZCp1k_79XQITX-fp8ukMAj9bowci6xAx3A4srU1PDwAPDITKOtfKJazc7Bx5Lh18jBtmts8nffQhSbfPXfBs24Ur0AeKvf--Wdr4PZFFYJXKI5OO9eyFxRJ46_9hMHh",
        ],
      },
      stock: 25,
    },
  },
  suggestions: [
    {
      id: "2",
      name: "Field Linen Shirt",
      price: 128,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24",
    },
    {
      id: "3",
      name: "Coastal Overshirt",
      price: 139,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBd-YsR-XNfNdYYiIB9pddWYzQC4GRRh3DinlyIPQEjXj4Qo5lD3hjDLANrRM_0GaTR_NjueqE0fduw4-W_Po0s9oVjba9rP0-abr2-VthEqyRv2aeSKUAIrZCp1k_79XQITX-fp8ukMAj9bowci6xAx3A4srU1PDwAPDITKOtfKJazc7Bx5Lh18jBtmts8nffQhSbfPXfBs24Ur0AeKvf--Wdr4PZFFYJXKI5OO9eyFxRJ46_9hMHh",
    },
    {
      id: "4",
      name: "Dune Linen Overshirt",
      price: 152,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCe8G22N74E_A_vF_DFLb4Pr4WDTtE7F2om8PrfNlWfz5WiX_o5_V6-jurTcLfOXDu_a67jizLGLsqEHAuGkoesszXs4Sc6wdjeHVvSK22IxmA8MJmcoOdR2AVRX1DK1mJDs5V4THnUWKod-MbakZTLqlArzILiTpFKYiISLsFDiiFEsK6n7oUs9eewAVSFrc0ealoxTmYyl1hkLZUshqLAgDcnq8nVfQbspdsTS0rGnSVimYSVlQQs",
    },
    {
      id: "5",
      name: "Harbor Linen Shirt",
      price: 118,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24",
    },
  ],
};


export const CHECKOUT_MOCK: CheckoutSummary = {
  shipping: {
    email: "jane.doe@example.com",
    phone: "+1 (555) 019-2834",
    name: "Jane Doe",
    address: "123 North Avenue, Apt 4B",
    city: "Seattle, WA 98101, United States",
  },
  items: [
    {
      id: "overshirt",
      name: "Linen Overshirt",
      variantLabel: "Stone Grey / M",
      quantity: 1,
      price: 185,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBekkEd-XmBI6P3eJZsi1501kboBRBeHFKoQ8KnzNMmOEDzehrj1Tn0pRwFCE4vS-C52o5a06kdedaZTC3cc23aVLfm76kXl-kC_HFFC5tabJk9_8Tjmu43LyJOw_6sfpfq9Uv8vhDQQp5uUs9tP2UV0tkBxhj12VCDA_p-jywFFA2BYdQwB6vpaCE9AN0rOqvn10tt8n0aQIFPXpfWSyIiXD6612uoWad_viDaUGD1JhX9lbhp75ym",
    },
    {
      id: "tote",
      name: "Canvas Utility Tote",
      variantLabel: "Forest Green / OS",
      quantity: 1,
      price: 95,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuALWddAbLnUEmtsYvhiWYEs3tXlr_hBRhGo_n6QwTnIxK55soMgLapkmZawTu5LCoprtqIrtBKVYO6gh_5sXzDVbRfEfbR7lO-GOYNUuoFNpCPb7obWmbWtX0tNHPRwrMIXnqLzfDg0CRVlPkd2SOzyQ6ZW008sUjdPREptCSEc0cXQQvrdDuWRgiIIMC7O__YG1ithiQNt4cOciM7JjdZgNRS51jlIANGwyq3WKyK5_LzrZ8vEx83P",
    },
  ],
  subtotal: 280,
  shippingLabel: "Complimentary",
  total: 280,
};

export const PRODUCTS_MOCK = [
  {
    name: "Camisa de lino",
    category: "Camisas",
    price: 145,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCe8G22N74E_A_vF_DFLb4Pr4WDTtE7F2om8PrfNlWfz5WiX_o5_V6-jurTcLfOXDu_a67jizLGLsqEHAuGkoesszXs4Sc6wdjeHVvSK22IxmA8MJmcoOdR2AVRX1DK1mJDs5V4THnUWKod-MbakZTLqlArzILiTpFKYiISLsFDiiFEsK6n7oUs9eewAVSFrc0ealoxTmYyl1hkLZUshqLAgDcnq8nVfQbspdsTS0rGnSVimYSVlQQs",
  },
  {
    name: "Field Linen Shirt",
    category: "Camisas",
    price: 128,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24",
  },
  {
    name: "Coastal Overshirt",
    category: "Camisas",
    price: 139,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd-YsR-XNfNdYYiIB9pddWYzQC4GRRh3DinlyIPQEjXj4Qo5lD3hjDLANrRM_0GaTR_NjueqE0fduw4-W_Po0s9oVjba9rP0-abr2-VthEqyRv2aeSKUAIrZCp1k_79XQITX-fp8ukMAj9bowci6xAx3A4srU1PDwAPDITKOtfKJazc7Bx5Lh18jBtmts8nffQhSbfPXfBs24Ur0AeKvf--Wdr4PZFFYJXKI5OO9eyFxRJ46_9hMHh",
  },
  {
    name: "Dune Linen Overshirt",
    category: "Pantalones",
    price: 152,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCe8G22N74E_A_vF_DFLb4Pr4WDTtE7F2om8PrfNlWfz5WiX_o5_V6-jurTcLfOXDu_a67jizLGLsqEHAuGkoesszXs4Sc6wdjeHVvSK22IxmA8MJmcoOdR2AVRX1DK1mJDs5V4THnUWKod-MbakZTLqlArzILiTpFKYiISLsFDiiFEsK6n7oUs9eewAVSFrc0ealoxTmYyl1hkLZUshqLAgDcnq8nVfQbspdsTS0rGnSVimYSVlQQs",
  },
  {
    name: "Harbor Linen Shirt",
    category: "Camisas",
    price: 118,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMn1DJnKYB5FMQoR7oSs53BpdsFlVDrZSBSzM6Gc9KnBY9Hf8iwcsi8nHXY7BJAG_xlyStcYz6qyhpeqo5yCHvmmyGv_wGsXpEKCfB0IrbKzGufd9raZGSL07Bz8boWB3FwFxLkaUrFROOd4NrA_07soH9StsyQizJ8_WN5jS_SpJ5nYLei3dqXGArKy3btgyKderS1R8Ebnuoas11Ss1iB0AKKJzD3bDUebP5bfC90vYRXKmCcR24",
  },
];

// ─── Seed mocks: Usuarios ────────────────────────────────────────────
export const USERS_MOCK = [
  {
    name: "Carlos",
    last_name: "Mendoza",
    email: "carlos.mendoza@example.com",
    phone: "+51 987 654 321",
    role: "CUSTOMER" as const,
  },
  {
    name: "Valeria",
    last_name: "Ríos",
    email: "valeria.rios@example.com",
    phone: "+51 912 345 678",
    role: "CUSTOMER" as const,
  },
  {
    name: "Rodrigo",
    last_name: "Alva",
    email: "rodrigo.alva@example.com",
    phone: "+51 945 678 123",
    role: "CUSTOMER" as const,
  },
];

// ─── Seed mocks: Direcciones ─────────────────────────────────────────
export const ADDRESSES_MOCK = [
  {
    user_email: "carlos.mendoza@example.com",
    recipient: "Carlos Mendoza",
    contact_phone: "+51 987 654 321",
    address_line: "Av. Larco 456, Dpto 301",
    city: "Lima",
    reference: "A espaldas del parque",
    is_default: true,
  },
  {
    user_email: "valeria.rios@example.com",
    recipient: "Valeria Ríos",
    contact_phone: "+51 912 345 678",
    address_line: "Calle Los Pinos 789, San Isidro",
    city: "Lima",
    reference: "Frente a la embajada",
    is_default: true,
  },
  {
    user_email: "rodrigo.alva@example.com",
    recipient: "Rodrigo Alva",
    contact_phone: "+51 945 678 123",
    address_line: "Jr. Salaverry 320",
    city: "Arequipa",
    reference: "Casa de dos pisos blanca",
    is_default: true,
  },
];

// ─── UI mocks: Órdenes ───────────────────────────────────────────────
export const ORDERS_MOCK: Order[] = [
  {
    id: "ord_001",
    user_id: "usr_001",
    address_id: "addr_001",
    subtotal: 267.0,
    shipping_cost: 15.0,
    total: 282.0,
    status: "PAID",
    created_at: "2026-03-01T12:00:00.000Z",
    updated_at: "2026-03-01T12:00:00.000Z",
    items: [
      {
        id: "item_001",
        order_id: "ord_001",
        variant_id: "var_001",
        sku_snapshot: "CAMISA-DE-LINO-1-S",
        product_name_snapshot: "Camisa de lino",
        unit_price: 145.0,
        quantity: 1,
        subtotal: 145.0,
      },
      {
        id: "item_002",
        order_id: "ord_001",
        variant_id: "var_002",
        sku_snapshot: "FIELD-LINEN-SHIRT-2-M",
        product_name_snapshot: "Field Linen Shirt",
        unit_price: 122.0,
        quantity: 1,
        subtotal: 122.0,
      },
    ],
  },
  {
    id: "ord_002",
    user_id: "usr_002",
    address_id: "addr_002",
    subtotal: 290.0,
    shipping_cost: 0.0,
    total: 290.0,
    status: "DELIVERED",
    created_at: "2026-03-05T15:30:00.000Z",
    updated_at: "2026-03-07T10:00:00.000Z",
    items: [
      {
        id: "item_003",
        order_id: "ord_002",
        variant_id: "var_003",
        sku_snapshot: "CAMISA-DE-LINO-1-L",
        product_name_snapshot: "Camisa de lino",
        unit_price: 145.0,
        quantity: 2,
        subtotal: 290.0,
      },
    ],
  },
  {
    id: "ord_003",
    user_id: "usr_003",
    address_id: "addr_003",
    subtotal: 139.0,
    shipping_cost: 20.0,
    total: 159.0,
    status: "PREPARING",
    created_at: "2026-03-10T18:00:00.000Z",
    updated_at: "2026-03-10T18:00:00.000Z",
    items: [
      {
        id: "item_004",
        order_id: "ord_003",
        variant_id: "var_004",
        sku_snapshot: "COASTAL-OVERSHIRT-3-M",
        product_name_snapshot: "Coastal Overshirt",
        unit_price: 139.0,
        quantity: 1,
        subtotal: 139.0,
      },
    ],
  },
];

// ─── Seed mocks: Órdenes ─────────────────────────────────────────────
export const SEED_ORDERS_MOCK = [
  {
    user_email: "carlos.mendoza@example.com",
    status: "PAID" as const,
    subtotal: 267.0,
    shipping_cost: 15.0,
    total: 282.0,
    payment: {
      amount: 282.0,
      payment_method: "CARD" as const,
      gateway: "STRIPE" as const,
      gateway_transaction_id: "ch_stripe_mock_001",
      status: "APPROVED" as const,
      paid_at: new Date("2026-03-01T12:00:00Z"),
    },
    fiscal_receipt: {
      voucher_type: "BOLETA" as const,
      identity_document_type: "DNI" as const,
      identity_document_number: "72819283",
      business_name: "Carlos Mendoza",
      fiscal_address: "Av. Larco 456, Lima",
      serial_number: "B001-00001201",
      fiscal_status: "ISSUED" as const,
    },
  },
  {
    user_email: "valeria.rios@example.com",
    status: "DELIVERED" as const,
    subtotal: 290.0,
    shipping_cost: 0.0,
    total: 290.0,
    payment: {
      amount: 290.0,
      payment_method: "TRANSFER" as const,
      gateway: "NONE" as const,
      status: "APPROVED" as const,
      voucher_url: "https://example.com/vouchers/v_002.pdf",
      paid_at: new Date("2026-03-05T15:30:00Z"),
    },
    fiscal_receipt: {
      voucher_type: "FACTURA" as const,
      identity_document_type: "RUC" as const,
      identity_document_number: "20601234567",
      business_name: "Valeria Studio S.A.C.",
      fiscal_address: "Calle Los Pinos 789, Lima",
      serial_number: "F001-00000543",
      fiscal_status: "ISSUED" as const,
    },
  },
  {
    user_email: "rodrigo.alva@example.com",
    status: "PREPARING" as const,
    subtotal: 139.0,
    shipping_cost: 20.0,
    total: 159.0,
    payment: {
      amount: 159.0,
      payment_method: "CARD" as const,
      gateway: "MERCADO_PAGO" as const,
      gateway_transaction_id: "mp_tx_998877",
      status: "APPROVED" as const,
      paid_at: new Date("2026-03-10T18:00:00Z"),
    },
  },
];

// ─── Seed mocks: Items de órdenes ────────────────────────────────────
// sku_snapshot debe coincidir con el formato del seed: `${PRODUCT_SLUG_UPPERCASE}-${SIZE}`
// Products (index): 0=Camisa de lino, 1=Field Linen Shirt, 2=Coastal Overshirt
export const ORDER_ITEMS_MOCK = [
  {
    order_ref: { user_email: "carlos.mendoza@example.com", status: "PAID" as const },
    sku_snapshot: "CAMISA-DE-LINO-1-S",
    product_name_snapshot: "Camisa de lino",
    quantity: 1,
    unit_price: 145.0,
    subtotal: 145.0,
  },
  {
    order_ref: { user_email: "carlos.mendoza@example.com", status: "PAID" as const },
    sku_snapshot: "FIELD-LINEN-SHIRT-2-M",
    product_name_snapshot: "Field Linen Shirt",
    quantity: 1,
    unit_price: 122.0,
    subtotal: 122.0,
  },
  {
    order_ref: { user_email: "valeria.rios@example.com", status: "DELIVERED" as const },
    sku_snapshot: "CAMISA-DE-LINO-1-L",
    product_name_snapshot: "Camisa de lino",
    quantity: 2,
    unit_price: 145.0,
    subtotal: 290.0,
  },
  {
    order_ref: { user_email: "rodrigo.alva@example.com", status: "PREPARING" as const },
    sku_snapshot: "COASTAL-OVERSHIRT-3-M",
    product_name_snapshot: "Coastal Overshirt",
    quantity: 1,
    unit_price: 139.0,
    subtotal: 139.0,
  },
];

