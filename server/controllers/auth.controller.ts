import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient"; // Zorg dat het pad naar uw supabaseClient correct is
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Een geheime sleutel voor JWT - Plaats dit in een .env bestand in een echt project!
const JWT_SECRET = process.env.JWT_SECRET || "your-very-secure-secret-key"; 

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-mail en wachtwoord zijn verplicht." });
  }

  try {
    // Controleer eerst of de gebruiker al bestaat (optioneel, Supabase Auth doet dit ook)
    // const { data: existingUser, error: existingUserError } = await supabase
    //   .from("users") // Gebruik uw tabelnaam als u niet Supabase Auth direct gebruikt
    //   .select("email")
    //   .eq("email", email)
    //   .single();

    // if (existingUser) {
    //   return res.status(400).json({ message: "Gebruiker met dit e-mailadres bestaat al." });
    // }

    // Gebruik Supabase Auth voor registratie
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName, // Optionele metadata
          // role: "user" // U kunt hier een standaard rol meegeven als uw users tabel dit heeft
        }
      }
    });

    if (error) {
      console.error("Supabase signUp error:", error);
      return res.status(400).json({ message: error.message });
    }

    // Als u een aparte "users" of "profiles" tabel heeft die u wilt vullen na Supabase Auth registratie:
    // if (data.user) {
    //   const { error: profileError } = await supabase
    //     .from("users") // of "profiles"
    //     .insert([{ 
    //        id: data.user.id, // Koppel aan de auth.users id
    //        email: data.user.email,
    //        full_name: fullName,
    //        // role: "user" 
    //     }]);
    //   if (profileError) {
    //     console.error("Error creating user profile:", profileError);
    //     // Overweeg wat hier te doen, bijv. de auth user verwijderen of een foutmelding geven
    //   }
    // }

    res.status(201).json({ message: "Gebruiker succesvol geregistreerd. Controleer uw e-mail voor verificatie.", user: data.user });

  } catch (err) {
    console.error("Register user error:", err);
    const error = err as Error;
    res.status(500).json({ message: "Serverfout bij registratie.", error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-mail en wachtwoord zijn verplicht." });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Supabase signIn error:", error);
      return res.status(401).json({ message: error.message });
    }

    if (data.session && data.user) {
      // Maak een JWT token
      // De payload kan meer gebruikersinfo bevatten indien nodig
      const token = jwt.sign(
        { userId: data.user.id, email: data.user.email, role: data.user.app_metadata?.role || data.user.user_metadata?.role || "user" }, 
        JWT_SECRET, 
        { expiresIn: "1h" } // Token verloopt na 1 uur
      );
      res.status(200).json({ 
        message: "Succesvol ingelogd", 
        token: token, 
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name,
          role: data.user.app_metadata?.role || data.user.user_metadata?.role || "user"
        }
      });
    } else {
      // Dit zou niet mogen gebeuren als er geen error is en wel een sessie
      return res.status(500).json({ message: "Inloggen mislukt, geen sessie data." });
    }

  } catch (err) {
    console.error("Login user error:", err);
    const error = err as Error;
    res.status(500).json({ message: "Serverfout bij inloggen.", error: error.message });
  }
};
