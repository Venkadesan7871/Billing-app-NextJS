import { NextResponse } from 'next/server';
import { getUsersCollection } from '../../lib/db';
import { getBillingDetailsCollection } from '../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const username = body?.username?.trim();
    const password = body?.password?.trim();
    const mobile = body?.mobile?.trim();
    const email = body?.email?.trim();
    const restaurantName = body?.restaurantName?.trim();
    const address = body?.address?.trim();

    if (!username || !password || !mobile || !email || !restaurantName || !address) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const usersCol = await getUsersCollection();
    try {
      await usersCol.createIndex({ username: 1 }, { unique: true });
    } catch {}

    const existing = await usersCol.findOne({ username });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    await usersCol.insertOne({ username, password: hash, mobile, email, restaurantName, address, createdAt: new Date() });

    // Create initial billing profile
    const billingCol = await getBillingDetailsCollection();
    try {
      await billingCol.createIndex({ username: 1 }, { unique: true });
    } catch {}

    const billingDoc = {
      username,
      mobile,
      email,
      restaurantName,
      address,
      addedItems: [],
      cardInfo: [],
      menuItems: [
        {
          img: "https://thumbs.dreamstime.com/b/delicious-idli-served-dipping-sauce-spices-banana-leaf-platter-soft-fluffy-placed-vibrant-green-accompanied-370204455.jpg",
          name: "Idly",
          cost: "₹50.00",
          label: "Plate of Idly with chutney and sambar",
          category: ['all', 'tiffen', 'main'],
          id: 1,
        },
        {
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9ODtiTma7boOyetjOCIzrqbO84Dha0X1FYMptpIsXBljUMjBFjnwmY7V-owvBOytK1ZTW4aj17PmX_p-0i2wmp91ya0tOndHev4-bv_xnL2-5dKjAwoX2ayTPw_I6Seelxq2FFtm7cGqVpgxNFS5XSH5EmU9Sl19NZwhAKhUGdqDmupkIo5hRiQeeCOEwZDiTfswNB-gbFVF2Fc51hY16u0VcA1pxPv0jIgak9A2XexSUHRWXY35OBpLcaSBxw4k0IGa7KOnn6NmR",
          name: "Masala Dosa",
          cost: "₹90.00",
          label: "Crispy Masala Dosa with fillings",
          category: ['all', 'tiffen', 'main'],
          id: 2,
        },
        {
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8aY0V1vUwYx_XqeG3YbdX8XBfWRCByv3KnlUbqKAS4IycfRmp6IuRpMVxP5oS4HL_uqPjNySj0OWI5KJxL20kHRbtB5gpu84xNa1bCJkVYtpKwQOiQAkQQDKeR2GBqftzLBSKW0Pd2s9POIXfXAJlJr9YI3QlAGP5EydaBm3y_q5lldzqJIfZa4xdRNOFgJoi8SwKKr2oWGUAfUtSuPpehcFOHR7AeHd0wABynyy5VW217zcd-fpbJKQQS4-BgLHIVY6UXMPx2-vn",
          name: "Ghee Roast",
          cost: "₹100.00",
          label: "Golden brown Ghee Roast dosa",
          category: ['all', 'tiffen', 'main'],
          id: 3,
        },
        {
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaIR4zT-w_6qG782W1jzJc7leAEhA7mkjBxWw7fM60yRUlcwl2et5PrBa-VX3xJKAW0S4j4YK1Mam5UoZHivRrNrzn8saTyMY4mEq7YeUq02BEBYU_Dg13PaFlFWzMVeFm1M3Aqe8o-q1O7kvwpdf-lkLLyjGEOgapKJA3A8wuL907Y23eEY05fztojXkpyYyxFmGSftggwm2R1irp1dmWeOtz3GGGhliGjQMWMfe-YJWsl1tkbgaR_OICoFPy97Oi-AVhLrfKV_77",
          name: "Medu Vada",
          cost: "₹20.00",
          label: "Plate of Medu Vada",
          category: ['all', 'snacks'],
          id: 4,
        },
        {
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjhgFdAc7OTlUA6WPMcCW8cxvnKC7M__y1hIBWRb0sKKXD4AVtk9jeA1FtnOopU5ni2XPz42HkmPEvqMu76TO8vW5LrkrQ3Gui_z493Yy2w4yI0m5hqLhOgAYdXxI-h_JvWswA6yT-xg8NsDPBRulCjZRGoAt0OlNWaY-6fKhq42IRbfdcGKY3v4mksztLXtDaEx5pucRMTdR3LkOAoIJgLOYdadJ8Ier7q0bFz8tfEHcm7013mydvtzgHZj6FqVMX0cWhoJrFexc3",
          name: "Filter Coffee",
          cost: "₹30.00",
          label: "Freshly brewed filter coffee",
          category: ['all', 'beverages'],
          id: 5,
        },
        {
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfzGVVuGBrb1zN-dXkeD4im3nckyeOubToPgbB-aK6Sm_x0wFhJsEoU9JRFNPFL8mNh-5ywbQu9VmApLTmdwRJAf7fFyvBMMSy_yHO5KsLZQHlEkGULL5mSTzZgXjjKPfJ2UPNRgRAQPwk1wdIjAoJ9ZV0CbOmRIG7BAWll-1a4L181qGtZwWBmLyBrnLC90h-THll4IsitM681I0r_MBDg-OIYPCcyR9XNYQ2pZ6wG7GuTnhm5kw1bOQ_sD0xW7eQQOeIyCfbmgkW",
          name: "Poori Masala",
          cost: "₹80.00",
          label: "Indian bread Poori with curry",
          category: ['all', 'tiffen', 'main'],
          id: 6,
        },
      ],
      report: [],
      createdAt: new Date(),
    };
    await billingCol.insertOne(billingDoc);

    return NextResponse.json({ message: 'Registered successfully' }, { status: 201 });
  } catch (err) {
    const msg = err?.message?.includes('MONGO_URI') ? 'Server DB not configured. Set MONGO_URI and DB_NAME in .env.local and restart.' : 'Internal server error';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
