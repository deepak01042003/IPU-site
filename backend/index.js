import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redis from "redis";
import { promisify } from "util";
import path from "path";
import pkg from "pg";

const app = express();

app.use(express.json());
app.use(cors());

const { Pool } = pkg;

// Use environment variables for database connection
const db = new Pool({
   user: "deepak",
    host: "dpg-cvlbn73e5dus73abh6ug-a.oregon-postgres.render.com",
    database: "deeps",
    password: "eZLyZqhlzbKNHDdwh3VZCDoTmiCu3X1r",
    port: 5432,
   ssl: {
    require: true,
    rejectUnauthorized: false, // Use with caution
  },
});

const createUsersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        );`;

    try {
        await db.query(query);
        console.log("Users table created successfully");
    } catch (error) {
        console.error("Error creating users table:", error);
    }
};

// Call the function to create the table
//createUsersTable();

app.post("/api/courses/add", async (req, res) => {
    console.log("Received POST request to /api/courses/add");
    console.log("Request body:", req.body);
    const { name, description } = req.body;
    try {
        await db.query("INSERT INTO course (course_name, course_detail) VALUES ($1, $2)", [name, description]);
        res.json({ message: "Course added" });
    } catch (error) {
        console.error("Error adding course:", error);
        res.status(500).json({ error: "Error adding course" });
    }
});

app.delete("/api/courses/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM course WHERE course_id = $1", [id]);
        res.json({ message: "Course deleted" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting course" });
    }
});

app.get('/api/courses', async (req, res) => {
    try {
        const result = await db.query('SELECT course_id, course_name, course_detail FROM course;');
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/api/placements/add", async (req, res) => {
    console.log("Received POST request to /api/placements/add");
    console.log("Request body:", req.body);
    const { plactype, placname, placdetail, placlink, deadline } = req.body;

    try {
        await db.query(
            "INSERT INTO placements (placement_type, placement_name, placement_detail, placement_link, placement_deadline) VALUES ($1, $2, $3, $4, $5)",
            [plactype, placname, placdetail, placlink, deadline]
        );
        res.json({ message: "Placements added" });
    } catch (error) {
        console.error("Error adding Placements:", error);
        res.status(500).json({ error: "Error adding Placements" });
    }
});

app.delete("/api/placements/delete/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Received delete request for ID:", id);
    console.log("SQL Query: DELETE FROM placements WHERE placement_id = $1", [id]);
    try {
        const result = await db.query("DELETE FROM placements WHERE placement_id = $1", [id]);
        console.log("Database result:", result);
        res.json({ message: "Placement deleted" });
    } catch (error) {
        console.error("Error deleting placement:", error);
        res.status(500).json({ error: "Error deleting placement" });
    }
});

app.get('/api/placements', async (req, res) => {
    try {
        const result = await db.query('SELECT placement_id, placement_type, placement_name, placement_detail, placement_link, placement_deadline FROM placements;');
        const placements = result.rows.map(placement => {
            let status = 'Current';

            if (placement.placement_deadline) {
                const deadline = new Date(placement.placement_deadline);
                const now = new Date();

                if (deadline < now) {
                    status = 'Expired';
                }
            }

            return {
                ...placement,
                status: status,
            };
        });

        res.json(placements);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

console.log("hello");

// Use environment PORT or default to 3000
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
