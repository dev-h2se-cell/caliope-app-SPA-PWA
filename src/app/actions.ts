
'use server';

import type { WellnessService } from '@/lib/types';
import { getWellnessServices, getProduct } from '@/app/admin/actions';
import { getAdminDb } from '@/lib/firebase-admin-config';

// All AI-related flows have been removed to fix the build.
// You can re-integrate them later once the compatibility issues are resolved.

import { generateWellnessRecommendations } from '@/lib/gemini';

export async function getRecommendationsAction(
    preferences: string
): Promise<WellnessService[]> {
    // 1. Intentar generar recomendaciones con IA
    // console.log("Consulting Gemini for:", preferences);
    const aiSuggestions = await generateWellnessRecommendations(preferences);

    if (aiSuggestions.length > 0) {
        return aiSuggestions;
    }

    // 2. Fallback: Si la IA falla o no retorna nada, devolver servicios genéricos
    console.log("AI returned empty, falling back to database services.");
    const { services } = await getWellnessServices({ page: 1, pageSize: 5 });
    return services;
}

// The following actions are placeholders and do not perform any real operations.

export async function handleGoogleSignInAction(input: any): Promise<{ success: boolean; userId: string; isNewUser: boolean; } | { success: boolean; error: string; }> {
    try {
        const db = getAdminDb();
        const userId = input.uid;

        if (!db) {
            // console.log("DEMO_MODE/NO-ADMIN: Simulating Google Sign-In.", input);
            return { success: true, userId: userId || 'mock-user-id', isNewUser: false };
        }

        // console.log("REAL ACTION: Handling Google Sign-In for", userId);

        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            // Create user if it doesn't exist (first login)
            const newUser = {
                uid: userId,
                email: input.email,
                name: input.displayName || 'Usuario sin nombre',
                createdAt: new Date().toISOString(),
                loyaltyPoints: 0,
                isAdmin: false,
                isProfessional: false,
                photoURL: input.photoURL || null
            };
            await userRef.set(newUser);
            return { success: true, userId, isNewUser: true };
        }

        return { success: true, userId, isNewUser: false };

    } catch (error: any) {
        console.error("Error in handleGoogleSignInAction:", error);
        return { success: false, error: error.message };
    }
}

export async function handleUserRegistrationAction(input: any): Promise<{ success: boolean; userId: string; } | { success: boolean; error: string; }> {
    try {
        const db = getAdminDb();
        const userId = input.uid; // Assumes the client passes the UID created by Firebase Auth

        if (!db) {
            // console.log("DEMO_MODE/NO-ADMIN: Simulating user registration.", input);
            return { success: true, userId: userId || 'mock-user-id' };
        }

        // console.log("REAL ACTION: Registering user in Firestore", userId);

        const newUser = {
            uid: userId,
            email: input.email,
            name: input.name,
            createdAt: new Date().toISOString(),
            loyaltyPoints: 0,
            isAdmin: false,
            isProfessional: false,
            phone: input.phone || '',
            address: input.address || ''
        };

        await db.collection('users').doc(userId).set(newUser);

        return { success: true, userId };
    } catch (error: any) {
        console.error("Error in handleUserRegistrationAction:", error);
        return { success: false, error: error.message };
    }
}

type ProfessionalRegistrationResult = { success: true; professionalId: string; } | { success: false; error: string; };

export async function handleProfessionalRegistrationAction(input: any): Promise<ProfessionalRegistrationResult> {
    try {
        const db = getAdminDb();
        const profId = input.uid;

        if (!db) {
            // console.log("DEMO_MODE/NO-ADMIN: Simulating professional registration.", input);
            return { success: true, professionalId: profId || 'mock-prof-id' };
        }

        // console.log("REAL ACTION: Registering professional in Firestore", profId);

        const newProfessional = {
            id: profId,
            email: input.email,
            name: input.name,
            bio: input.bio || '',
            specialties: input.specialties || [],
            profileImageUrl: input.profileImageUrl || '',
            rating: 0,
            reviewCount: 0,
            isVerified: false, // Requires manual verification by default
            createdAt: new Date().toISOString(),
            phone: input.phone || '',
            address: input.address || ''
        };

        // Batch write to ensure consistency: Create Professional Profile AND Update User Role
        const batch = db.batch();
        const profRef = db.collection('professionals').doc(profId);
        const userRef = db.collection('users').doc(profId);

        batch.set(profRef, newProfessional);
        batch.set(userRef, { isProfessional: true }, { merge: true }); // Update existing user doc

        await batch.commit();

        return { success: true, professionalId: profId };
    } catch (error: any) {
        console.error("Error in handleProfessionalRegistrationAction:", error);
        return { success: false, error: error.message };
    }
}

export async function handleUserProfileUpdateAction(input: any): Promise<{ success: boolean; error?: string }> {
    try {
        const db = getAdminDb();

        if (!db) {
            // console.log("DEMO_MODE/NO-ADMIN: Simulating user profile update.", input);
            return { success: true };
        }

        if (!input.uid) {
            throw new Error('User UID is required for update.');
        }

        // console.log("REAL ACTION: Updating user profile in Firestore", input.uid);

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.phone) updateData.phone = input.phone;
        if (input.address) updateData.address = input.address;

        // Use merge: true implicitly by using update, or set with merge if document might not exist (safer)
        await db.collection('users').doc(input.uid).set(updateData, { merge: true });

        return { success: true };
    } catch (error: any) {
        console.error("Error in handleUserProfileUpdateAction:", error);
        return { success: false, error: error.message };
    }
}

export async function createAppointmentAction(input: {
    userId: string;
    userName: string;
    serviceId: string;
    serviceName: string;
    price: number;
    date: string; // ISO String
    professionalId?: string;
    professionalName?: string;
}): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
    try {
        const db = getAdminDb();

        if (!db) {
            // console.log("DEMO_MODE/NO-ADMIN: Simulating appointment creation.", input);
            return { success: true, appointmentId: `mock-appt-${Date.now()}` };
        }

        // console.log("REAL ACTION: Creating appointment in Firestore", input);

        const newAppointmentRef = db.collection('appointments').doc();
        const appointmentData = {
            id: newAppointmentRef.id,
            userId: input.userId,
            userName: input.userName,
            serviceId: input.serviceId,
            serviceName: input.serviceName,
            price: input.price,
            appointmentDate: new Date(input.date), // Store as Timestamp
            professionalId: input.professionalId || 'pending-assignment',
            professionalName: input.professionalName || 'Por asignar',
            status: 'scheduled',
            createdAt: new Date()
        };

        await newAppointmentRef.set(appointmentData);

        return { success: true, appointmentId: newAppointmentRef.id };

    } catch (error: any) {
        console.error("Error in createAppointmentAction:", error);
        return { success: false, error: error.message };
    }
}

export async function createOrderAction(input: {
    userId: string;
    userName: string;
    items: { productId: string; name: string; price: number; quantity: number }[];
    total: number;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
        const db = getAdminDb();

        if (!db) {
            // console.log("DEMO_MODE/NO-ADMIN: Simulating order creation.", input);
            return { success: true, orderId: `mock-order-${Date.now()}` };
        }

        // console.log("REAL ACTION: Creating order in Firestore", input);

        const newOrderRef = db.collection('orders').doc();
        const orderData = {
            id: newOrderRef.id,
            userId: input.userId,
            userName: input.userName,
            items: input.items,
            total: input.total,
            status: 'pending_payment',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await newOrderRef.set(orderData);

        return { success: true, orderId: newOrderRef.id };

    } catch (error: any) {
        console.error("Error in createOrderAction:", error);
        return { success: false, error: error.message };
    }
}
