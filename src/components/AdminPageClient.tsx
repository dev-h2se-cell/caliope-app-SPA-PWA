
'use client';

import { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import useAuth from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, FileText, ShoppingBag, Pencil, Trash2, Download, CalendarDays, Search, Gift, Users, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getWellnessServices, getWellnessProducts, getAppointments, bulkAddProducts, bulkAddServices, getProductCategories, getServiceCategories, getRewards } from '@/app/admin/actions';
import type { WellnessService, Product, Appointment, Reward } from '@/lib/types';
import { BulkUploadCard } from '@/components/BulkUploadCard';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AgendaCalendarView } from '@/components/AgendaCalendarView';
import { Input } from '@/components/ui/input';
import { UserManagement } from '@/components/UserManagement';
import { ItemCreationDialog } from './ItemCreationDialog';
import { AccessDenied } from '@/components/ui/AccessDenied';

const PAGE_SIZE = 10;

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
    );
}

function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const [services, setServices] = useState<WellnessService[]>([]);
  const [servicePage, setServicePage] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const [isDataLoading, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'all'>('all');
  
  const [isItemCreationOpen, setIsItemCreationOpen] = useState(false);
  const [itemCreationType, setItemCreationType] = useState<'product' | 'service'>('product');

  const fetchProducts = useCallback((page: number, query: string = productSearchQuery, category: string = productCategoryFilter) => {
    startTransition(async () => {
      const { products: fetchedProducts, total } = await getWellnessProducts({ page, pageSize: PAGE_SIZE, query, category });
      setProducts(fetchedProducts);
      setTotalProducts(total);
    });
  }, [productSearchQuery, productCategoryFilter]);

  const fetchServices = useCallback((page: number, query: string = serviceSearchQuery, category: string = serviceCategoryFilter) => {
    startTransition(async () => {
      const { services: fetchedServices, total } = await getWellnessServices({ page, pageSize: PAGE_SIZE, query, category });
      setServices(fetchedServices);
      setTotalServices(total);
    });
  }, [serviceSearchQuery, serviceCategoryFilter]);

  useEffect(() => {
    fetchProducts(productPage, productSearchQuery, productCategoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productPage]);

  useEffect(() => {
    fetchServices(servicePage, serviceSearchQuery, serviceCategoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePage]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
        startTransition(async () => {
            const [pCategories, sCategories, fetchedAppointments, fetchedRewards] = await Promise.all([
                getProductCategories(),
                getServiceCategories(),
                getAppointments(),
                getRewards(),
            ]);
            setProductCategories(pCategories);
            setServiceCategories(sCategories);
            setAppointments(fetchedAppointments);
            setRewards(fetchedRewards);
        });
    }
    fetchInitialData();
  }, []);
  
  const handleOpenItemCreation = (type: 'product' | 'service') => {
    setItemCreationType(type);
    setIsItemCreationOpen(true);
  };

  const handleSearchSubmit = (type: 'products' | 'services') => (e: React.FormEvent) => {
      e.preventDefault();
      if (type === 'products') {
        setProductPage(1);
        fetchProducts(1, productSearchQuery, productCategoryFilter);
        setSelectedProducts(new Set());
      } else {
        setServicePage(1);
        fetchServices(1, serviceSearchQuery, serviceCategoryFilter);
        setSelectedServices(new Set());
      }
  }
  
  const handleCategoryFilterChange = (type: 'products' | 'services') => (category: string) => {
      if (type === 'products') {
        setProductCategoryFilter(category);
        setProductSearchQuery('');
        setProductPage(1);
        fetchProducts(1, '', category);
        setSelectedProducts(new Set());
      } else {
        setServiceCategoryFilter(category);
        setServiceSearchQuery('');
        setServicePage(1);
        fetchServices(1, '', category);
        setSelectedServices(new Set());
      }
  }

  const onUploadSuccess = (type: 'product' | 'service') => {
    if (type === 'product') {
        fetchProducts(productPage, productSearchQuery, productCategoryFilter);
    } else {
        fetchServices(servicePage, serviceSearchQuery, serviceCategoryFilter);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  };

  const downloadJson = (data: any, filename: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${filename}.json`;
    link.click();
  };

  const handleDownloadSelected = async (type: 'products' | 'services') => {
    if (type === 'products') {
      const { products: allMatchingProducts } = await getWellnessProducts({ page: 1, pageSize: totalProducts, query: productSearchQuery, category: productCategoryFilter });
      const dataToDownload = allMatchingProducts.filter(p => selectedProducts.has(p.id));
      downloadJson(dataToDownload, 'selected_products');
    } else {
      const { services: allMatchingServices } = await getWellnessServices({ page: 1, pageSize: totalServices, query: serviceSearchQuery, category: serviceCategoryFilter });
      const dataToDownload = allMatchingServices.filter(s => selectedServices.has(s.id));
      downloadJson(dataToDownload, 'selected_services');
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    setSelectedProducts(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        return newSet;
    });
  };
  const handleSelectService = (id: string, checked: boolean) => {
    setSelectedServices(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        return newSet;
    });
  };
  
  const handleSelectAllProducts = async (checked: boolean) => {
      if (checked) {
          const { products: allMatchingProducts } = await getWellnessProducts({ page: 1, pageSize: totalProducts, query: productSearchQuery, category: productCategoryFilter });
          setSelectedProducts(new Set(allMatchingProducts.map(p => p.id)));
      } else {
          setSelectedProducts(new Set());
      }
  };
  const handleSelectAllServices = async (checked: boolean) => {
       if (checked) {
          const { services: allMatchingServices } = await getWellnessServices({ page: 1, pageSize: totalServices, query: serviceSearchQuery, category: serviceCategoryFilter });
          setSelectedServices(new Set(allMatchingServices.map(s => s.id)));
      } else {
          setSelectedServices(new Set());
      }
  };

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter(appt => appt.status === statusFilter);
  }, [appointments, statusFilter]);

  const totalProductPages = Math.ceil(totalProducts / PAGE_SIZE);
  const totalServicePages = Math.ceil(totalServices / PAGE_SIZE);

  const renderTableSkeleton = (columns: number) => (
      Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={`loading-${i}`}>
              <TableCell colSpan={columns}>
                  <Skeleton className="h-8 w-full" />
              </TableCell>
          </TableRow>
      ))
  );

  return (
    <>
      <ItemCreationDialog 
        isOpen={isItemCreationOpen}
        onOpenChange={setIsItemCreationOpen}
        itemType={itemCreationType}
        onSuccess={() => onUploadSuccess(itemCreationType)}
      />
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Usuarios</TabsTrigger>
          <TabsTrigger value="services"><FileText className="mr-2 h-4 w-4" /> Servicios</TabsTrigger>
          <TabsTrigger value="products"><ShoppingBag className="mr-2 h-4 w-4" /> Productos</TabsTrigger>
          <TabsTrigger value="rewards"><Gift className="mr-2 h-4 w-4" /> Recompensas</TabsTrigger>
          <TabsTrigger value="agenda"><CalendarDays className="mr-2 h-4 w-4" /> Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
            <UserManagement />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <BulkUploadCard onUploadSuccess={() => onUploadSuccess('service')} uploadAction={bulkAddServices} title="Carga Masiva de Servicios" description="Añade múltiples servicios a tu catálogo subiendo un archivo .json." buttonText="Subir Servicios" />
          <Card>
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div>
                      <CardTitle>Catálogo de Servicios</CardTitle>
                      <CardDescription>Gestiona los servicios de bienestar ofrecidos en la plataforma.</CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button onClick={() => handleDownloadSelected('services')} disabled={selectedServices.size === 0}>Descargar Seleccionados ({selectedServices.size})</Button>
                    <Button onClick={() => handleOpenItemCreation('service')}><PlusCircle className="mr-2 h-4 w-4"/>Crear Nuevo</Button>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <form onSubmit={handleSearchSubmit('services')} className="flex-1 flex gap-2">
                  <Input placeholder="Buscar por nombre..." value={serviceSearchQuery} onChange={(e) => setServiceSearchQuery(e.target.value)} className="max-w-sm" />
                  <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                </form>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline">Categoría: {serviceCategoryFilter === 'all' ? 'Todas' : serviceCategoryFilter}</Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Categorías</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleCategoryFilterChange('services')('all')}>Todas</DropdownMenuItem>
                    {serviceCategories.map(cat => (<DropdownMenuItem key={cat} onSelect={() => handleCategoryFilterChange('services')(cat)}>{cat}</DropdownMenuItem>))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Checkbox onCheckedChange={(checked) => handleSelectAllServices(!!checked)}/></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="w-[300px]">Descripción</TableHead>
                    <TableHead>Precio (COP)</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDataLoading ? renderTableSkeleton(6) : services.length > 0 ? (
                    services.map((service) => (
                      <TableRow key={service.id} data-state={selectedServices.has(service.id) ? 'selected' : ''}>
                        <TableCell><Checkbox checked={selectedServices.has(service.id)} onCheckedChange={(checked) => handleSelectService(service.id, !!checked)}/></TableCell>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-xs">{service.description}</TableCell>
                        <TableCell>{formatPrice(service.price)}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-start gap-2">
                              <Button variant="outline" size="icon" onClick={() => downloadJson(service, `service_${service.id}`)}><Download className="h-4 w-4" /></Button>
                              <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-center">No se encontraron servicios.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <div className="flex items-center justify-end space-x-2 py-4 px-6">
                  <div className="text-sm text-muted-foreground">Página {servicePage} de {totalServicePages}</div>
                  <Button variant="outline" size="sm" onClick={() => setServicePage(p => Math.max(p - 1, 1))} disabled={servicePage === 1 || isDataLoading}>Anterior</Button>
                  <Button variant="outline" size="sm" onClick={() => setServicePage(p => Math.min(p + 1, totalServicePages))} disabled={servicePage === totalServicePages || isDataLoading}>Siguiente</Button>
              </div>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <BulkUploadCard onUploadSuccess={() => onUploadSuccess('product')} uploadAction={bulkAddProducts} title="Carga Masiva de Productos" description="Añade múltiples productos a tu catálogo subiendo un archivo .json." buttonText="Subir Productos" />
          <Card>
            <CardHeader>
               <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                      <CardTitle>Catálogo de Productos</CardTitle>
                      <CardDescription>Gestiona los productos del e-commerce.</CardDescription>
                  </div>
                   <div className='flex items-center gap-2'>
                        <Button onClick={() => handleDownloadSelected('products')} disabled={selectedProducts.size === 0}>Descargar Seleccionados ({selectedProducts.size})</Button>
                        <Button onClick={() => handleOpenItemCreation('product')}><PlusCircle className="mr-2 h-4 w-4"/>Crear Nuevo</Button>
                   </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <form onSubmit={handleSearchSubmit('products')} className="flex-1 flex gap-2">
                  <Input placeholder="Buscar por nombre..." value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} className="max-w-sm" />
                  <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                </form>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline">Categoría: {productCategoryFilter === 'all' ? 'Todas' : productCategoryFilter}</Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Categorías</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleCategoryFilterChange('products')('all')}>Todas</DropdownMenuItem>
                    {productCategories.map(cat => (<DropdownMenuItem key={cat} onSelect={() => handleCategoryFilterChange('products')(cat)}>{cat}</DropdownMenuItem>))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-[50px]"><Checkbox onCheckedChange={(checked) => handleSelectAllProducts(!!checked)} /></TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="w-[300px]">Descripción</TableHead>
                          <TableHead>Precio (COP)</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Acciones</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {isDataLoading ? renderTableSkeleton(7) : products.length > 0 ? (
                          products.map((product) => (
                          <TableRow key={product.id} data-state={selectedProducts.has(product.id) ? 'selected' : ''}>
                              <TableCell><Checkbox checked={selectedProducts.has(product.id)} onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}/></TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell className="text-xs text-muted-foreground truncate max-w-xs">{product.description}</TableCell>
                              <TableCell>{formatPrice(product.price)}</TableCell>
                              <TableCell>{product.inStock ? 'Disponible' : 'Agotado'}</TableCell>
                              <TableCell>
                                  <div className="flex items-center justify-start gap-2">
                                    <Button variant="outline" size="icon" onClick={() => downloadJson(product, `product_${product.id}`)}><Download className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                              </TableCell>
                          </TableRow>
                          ))
                      ) : (
                          <TableRow><TableCell colSpan={7} className="text-center">No se encontraron productos.</TableCell></TableRow>
                      )}
                  </TableBody>
              </Table>
            </CardContent>
             <div className="flex items-center justify-end space-x-2 py-4 px-6">
                  <div className="text-sm text-muted-foreground">Página {productPage} de {totalProductPages}</div>
                  <Button variant="outline" size="sm" onClick={() => setProductPage(p => Math.max(p - 1, 1))} disabled={productPage === 1 || isDataLoading}>Anterior</Button>
                  <Button variant="outline" size="sm" onClick={() => setProductPage(p => Math.min(p + 1, totalProductPages))} disabled={productPage === totalProductPages || isDataLoading}>Siguiente</Button>
              </div>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
            <Card>
                <CardHeader>
                    <CardTitle>Sistema de Recompensas</CardTitle>
                    <CardDescription>Visualiza y gestiona las recompensas por nivel de lealtad.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Nivel</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isDataLoading && rewards.length === 0 ? renderTableSkeleton(4) : rewards.length > 0 ? (
                                rewards.map((reward) => (
                                    <TableRow key={reward.id}>
                                        <TableCell className="font-bold">{reward.level}</TableCell>
                                        <TableCell className="font-medium">{reward.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{reward.description}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-start gap-2">
                                              <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
                                              <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center">No se encontraron recompensas.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
         <TabsContent value="agenda">
           <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <div>
                          <CardTitle>Agenda de Citas</CardTitle>
                          <CardDescription>Administra todas las citas programadas en la plataforma.</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="outline">Filtrar por estado: {statusFilter === 'all' ? 'Todos' : statusFilter}</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                  <DropdownMenuItem onSelect={() => setStatusFilter('all')}>Todos</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setStatusFilter('scheduled')}>Programadas</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setStatusFilter('completed')}>Completadas</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setStatusFilter('cancelled')}>Canceladas</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
                  <AgendaCalendarView appointments={filteredAppointments} />
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default function AdminPageClient() {
    const { user, profile } = useAuth();
    const authLoading = user === undefined || (user && profile === undefined);
    const isAdmin = profile?.isAdmin ?? false;
    
    if (authLoading) {
        return (
             <div className="flex flex-col min-h-[50vh] justify-center items-center">
                <LoadingSkeleton />
            </div>
        );
    }

    if (!isAdmin) {
        return <AccessDenied />;
    }

    return <AdminDashboard />;
}
