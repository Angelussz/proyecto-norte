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

export const ORDERS_MOCK: Order[] = [
  {
    id: "e3b0c442-98fc-42c1-b978-2026a8d00001",
    user_id: "usr_998877665544",
    address_id: "addr_1234567890",
    subtotal: 140.0,
    shipping_cost: 15.0,
    total: 155.0,
    status: "DELIVERED",
    created_at: "2026-03-10T14:30:00.000Z",
    updated_at: "2026-03-12T10:00:00.000Z",
    items: [
      {
        id: "det_001",
        order_id: "e3b0c442-98fc-42c1-b978-2026a8d00001",
        variant_id: "var_polo_negro_m",
        sku_snapshot: "POLO-BLK-M",
        product_name_snapshot: "Polo Oversize Algodón Negro",
        unit_price: 50.0,
        quantity: 2,
        subtotal: 100.0,
      },
      {
        id: "det_002",
        order_id: "e3b0c442-98fc-42c1-b978-2026a8d00001",
        variant_id: "var_gorra_azul",
        sku_snapshot: "CAP-BLU-UNI",
        product_name_snapshot: "Gorra Urbana Azul",
        unit_price: 40.0,
        quantity: 1,
        subtotal: 40.0,
      },
    ],
  },
  {
    id: "f4c1d553-10ad-53d2-c089-3137b9e00002",
    user_id: "usr_998877665544",
    address_id: "addr_1234567890",
    subtotal: 120.0,
    shipping_cost: 10.0,
    total: 130.0,
    status: "PENDING_PAYMENT",
    created_at: "2026-03-15T09:15:00.000Z",
    updated_at: "2026-03-15T09:15:00.000Z",
    items: [
      {
        id: "det_003",
        order_id: "f4c1d553-10ad-53d2-c089-3137b9e00002",
        variant_id: "var_casaca_jean_l",
        sku_snapshot: "JKT-DEN-L",
        product_name_snapshot: "Casaca Denim Clásica",
        unit_price: 120.0,
        quantity: 1,
        subtotal: 120.0,
      },
    ],
  },
];

