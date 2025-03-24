import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/config/db';
import { getFirebaseAdmin } from '@/config/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// ตรวจสอบการ authentication
async function verifyAuth(req) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) return false;
    
    // ใช้ Firebase Admin SDK ตรวจสอบ token
    const app = getFirebaseAdmin();
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Auth error:', error);
    return false;
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'ไม่พบไฟล์ที่อัพโหลด' },
        { status: 400 }
      );
    }

    // ตรวจสอบและแปลงข้อมูลไฟล์
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ทำความสะอาดชื่อไฟล์และเตรียมข้อมูล
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const contentType = file.type || 'application/octet-stream';

    const query = `
      INSERT INTO images (name, data, content_type)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    const result = await pool.query(query, [
      fileName,
      buffer,
      contentType
    ]);

    return NextResponse.json({ 
      imageUrl: `/api/images/${result.rows[0].id}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการอัพโหลด' },
      { status: 500 }
    );
  }
}