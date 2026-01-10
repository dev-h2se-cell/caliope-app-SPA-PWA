
'use server';

import type { WellnessService, Product, ProductUpload, WellnessServiceUpload, Appointment, Reward, UserProfile } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase-admin-config';
import { FieldValue } from 'firebase-admin/firestore';
import { getUserLevel } from '@/lib/user-levels';

// Import mock data for demo mode
import { wellnessServices as mockWellnessServices } from '@/lib/wellness-services-data';
import { wellnessProducts as mockWellnessProducts } from '@/lib/products-data';
import { mockAppointments } from '@/lib/appointments-data';
import { rewardsData } from '@/lib/rewards-data';

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Helper function for demo mode pagination and filtering
function filterAndPaginate<T extends { name: string; category: string }>(items: T[], { page, pageSize, query, category }: { page: number; pageSize: number; query?: string; category?: string; }): { data: T[], total: number } {
    let filteredItems = items;

    if (query) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    if (category && category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
    }

    const total = filteredItems.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredItems.slice(start, end);

    return { data: paginatedData, total };
}

export async function getWellnessServices({ page = 1, pageSize = 10, query = '', category = 'all' }: { page: number; pageSize: number; query?: string; category?: string; }): Promise<{ services: WellnessService[], total: number }> {
  if (IS_DEMO_MODE) {
    // console.log("ACTIONS: Serving mock wellness services from local data.");
    const { data, total } = filterAndPaginate(mockWellnessServices, { page, pageSize, query, category });
    return { services: data, total };
  }

  const adminDb = getAdminDb();
  if (!adminDb) return { services: [], total: 0 };
  
  let servicesQuery = adminDb.collection('services');
  const snapshot = await servicesQuery.get();
  let allServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WellnessService[];

  const { data, total } = filterAndPaginate(allServices, { page, pageSize, query, category });
  return { services: data, total };
}

export async function getServiceById(id: string): Promise<WellnessService | null> {
    if (IS_DEMO_MODE) {
        return mockWellnessServices.find(s => s.id === id) || null;
    }
    const adminDb = getAdminDb();
    if (!adminDb) return null;
    try {
        const doc = await adminDb.collection('services').doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() } as WellnessService;
    } catch (error) {
        console.error("Error fetching service by ID:", error);
        return null;
    }
}


export async function getServiceCategories(): Promise<string[]> {
    if (IS_DEMO_MODE) {
        const categories = new Set(mockWellnessServices.map(s => s.category));
        return Array.from(categories);
    }
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('services').get();
    const categories = new Set(snapshot.docs.map(doc => doc.data().category as string));
    return Array.from(categories);
}

export async function getWellnessProducts({ page = 1, pageSize = 10, query = '', category = 'all' }: { page: number; pageSize: number; query?: string; category?: string; }): Promise<{ products: Product[], total: number }> {
  if (IS_DEMO_MODE) {
    // console.log("ACTIONS: Serving mock wellness products from local data.");
    const { data, total } = filterAndPaginate(mockWellnessProducts, { page, pageSize, query, category });
    return { products: data, total };
  }

  const adminDb = getAdminDb();
  if (!adminDb) return { products: [], total: 0 };

  const snapshot = await adminDb.collection('products').get();
  let allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

  const { data, total } = filterAndPaginate(allProducts, { page, pageSize, query, category });
  return { products: data, total };
}

export async function getProduct(id: string): Promise<Product | null> {
    if (IS_DEMO_MODE) {
        return mockWellnessProducts.find(p => p.id === id) || null;
    }
    const adminDb = getAdminDb();
    if (!adminDb) return null;
    try {
        const doc = await adminDb.collection('products').doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() } as Product;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }
}

export async function getProductCategories(): Promise<string[]> {
    if (IS_DEMO_MODE) {
        const categories = new Set(mockWellnessProducts.map(p => p.category));
        return Array.from(categories);
    }
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('products').get();
    const categories = new Set(snapshot.docs.map(doc => doc.data().category as string));
    return Array.from(categories);
}

export async function getAppointments(): Promise<Appointment[]> {
  if (IS_DEMO_MODE) {
    return Promise.resolve(mockAppointments);
  }
  const adminDb = getAdminDb();
  if (!adminDb) return [];
  const snapshot = await adminDb.collection('appointments').orderBy('appointmentDate', 'asc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      appointmentDate: (data.appointmentDate.toDate()).toISOString(),
      createdAt: data.createdAt.toDate().toISOString(),
    } as unknown as Appointment;
  });
}

export async function getRewards(): Promise<Reward[]> {
    return Promise.resolve(rewardsData);
}

async function bulkUpload(collectionName: string, items: any[], idPrefix: string) {
    if (IS_DEMO_MODE) {
        // console.log(`DEMO: Simulating bulk upload of ${items.length} items to ${collectionName}`);
        return items.length;
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("La base de datos del administrador no está disponible.");
    }

    const CHUNK_SIZE = 400; // Firestore limit is 500, we use 400 for safety
    const chunks = [];
    
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        chunks.push(items.slice(i, i + CHUNK_SIZE));
    }

    let totalProcessed = 0;

    for (const chunk of chunks) {
        const batch = adminDb.batch();
        const collectionRef = adminDb.collection(collectionName);

        chunk.forEach((item, index) => {
            // Unique ID generation based on timestamp and index within the whole batch
            const globalIndex = totalProcessed + index;
            const id = `${idPrefix}-${Date.now()}-${globalIndex}`;
            const docRef = collectionRef.doc(id);
            const newItem = {
                ...item,
                id,
                rating: 0,
                reviewCount: 0,
                createdAt: FieldValue.serverTimestamp(),
            };
            batch.set(docRef, newItem);
        });

        await batch.commit();
        totalProcessed += chunk.length;
    }

    return totalProcessed;
}

export async function bulkAddProducts(jsonContent: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
        const productsToUpload: ProductUpload[] = JSON.parse(jsonContent);
        if (!Array.isArray(productsToUpload)) throw new Error("El JSON debe ser un array.");
        
        const count = await bulkUpload('products', productsToUpload, 'prod');

        return { success: true, message: `${count} productos añadidos con éxito.`, count };

    } catch (error: any) {
        console.error("Error en la carga masiva de productos:", error);
        return { success: false, message: error.message || "Ocurrió un error.", count: 0 };
    }
}

export async function bulkAddServices(jsonContent: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
        const servicesToUpload: WellnessServiceUpload[] = JSON.parse(jsonContent);
        if (!Array.isArray(servicesToUpload)) throw new Error("El JSON debe ser un array.");
        
        const count = await bulkUpload('services', servicesToUpload, 'srv');

        return { success: true, message: `${count} servicios añadidos con éxito.`, count };
    } catch (error: any) {
        console.error("Error en la carga masiva de servicios:", error);
        return { success: false, message: error.message || "Ocurrió un error.", count: 0 };
    }
}


// Nueva función para obtener usuarios
export async function getUsers({ page = 1, pageSize = 10, query = '', role = 'all', level = 0, sortBy = 'createdAt', sortDirection = 'desc' }: { page: number; pageSize: number; query?: string; role?: 'all' | 'client' | 'professional' | 'admin'; level?: number; sortBy?: 'name' | 'email' | 'loyaltyPoints' | 'createdAt'; sortDirection?: 'asc' | 'desc' }): Promise<{ users: UserProfile[], total: number }> {
    if (IS_DEMO_MODE) {
        // En modo demo no tenemos una lista de usuarios mock, devolvemos un array vacío
        // para evitar errores, pero esto podría ampliarse en el futuro.
        // console.log("ACTIONS: Serving mock users (empty list) from local data.");
        return { users: [], total: 0 };
    }
    
    const adminDb = getAdminDb();
    if (!adminDb) return { users: [], total: 0 };

    // En una app real, la query y los filtros se harían en la base de datos.
    // Firestore tiene limitaciones, por lo que una solución escalable usaría Algolia/Typesense.
    // Para esta demo, filtramos en memoria.
    const snapshot = await adminDb.collection('users').orderBy(sortBy, sortDirection).get();
    let allUsers = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        uid: doc.id, 
        ...data,
        createdAt: (data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)).toISOString()
      } as UserProfile
    });

    // Filtrado
    if (query) {
        allUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
    }
    if (role !== 'all') {
        if (role === 'admin') allUsers = allUsers.filter(user => user.isAdmin);
        else if (role === 'professional') allUsers = allUsers.filter(user => user.isProfessional && !user.isAdmin);
        else if (role === 'client') allUsers = allUsers.filter(user => !user.isProfessional && !user.isAdmin);
    }
    if (level > 0) {
        allUsers = allUsers.filter(user => getUserLevel(user.loyaltyPoints).level === level);
    }

    const total = allUsers.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { users: allUsers.slice(start, end), total };
}

// Funciones para crear items individuales
export async function createProduct(data: ProductUpload): Promise<{ success: boolean; message: string; productId?: string }> {
    if (IS_DEMO_MODE) {
      console.warn("MODO DEMO: Se simulará la creación del producto.");
      return { success: true, message: 'Producto creado en modo simulación.', productId: `sim-${Date.now()}` };
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      return { success: false, message: 'La base de datos no está disponible.' };
    }
    try {
        const newDocRef = adminDb.collection('products').doc();
        const newProduct: Product = {
            ...data,
            id: newDocRef.id,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
        };
        await newDocRef.set(newProduct);
        return { success: true, message: 'Producto creado con éxito.', productId: newDocRef.id };
    } catch (error: any) {
        return { success: false, message: error.message || 'Error al crear el producto.' };
    }
}

export async function createService(data: WellnessServiceUpload): Promise<{ success: boolean; message: string; serviceId?: string }> {
    if (IS_DEMO_MODE) {
      console.warn("MODO DEMO: Se simulará la creación del servicio.");
      return { success: true, message: 'Servicio creado en modo simulación.', serviceId: `sim-${Date.now()}` };
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      return { success: false, message: 'La base de datos no está disponible.' };
    }
    try {
        const newDocRef = adminDb.collection('services').doc();
        const newService: WellnessService = {
            ...data,
            id: newDocRef.id,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
        };
        await newDocRef.set(newService);
        return { success: true, message: 'Servicio creado con éxito.', serviceId: newDocRef.id };
    } catch (error: any) {
        return { success: false, message: error.message || 'Error al crear el servicio.' };
    }
}
