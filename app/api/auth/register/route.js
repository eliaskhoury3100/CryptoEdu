import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "../../../../lib/db";

// Password validation function
function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate password: must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long
    if (!validatePassword(password)) {
      return NextResponse.json({
        error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.",
      }, { status: 400 });
    }

    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await createUser(name, email, password);
    return NextResponse.json(user, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
