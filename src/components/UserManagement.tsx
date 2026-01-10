
'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUsers } from '@/app/admin/actions';
import type { UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserLevel } from '@/lib/user-levels';
import { Skeleton } from './ui/skeleton';
import { TableRowSkeleton } from './TableRowSkeleton';
import { ArrowUpDown, Trash2 } from 'lucide-react';

const PAGE_SIZE = 10;

type SortableColumns = 'name' | 'email' | 'loyaltyPoints' | 'createdAt';

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | 'client' | 'professional' | 'admin'>('all');
  const [level, setLevel] = useState(0);
  const [sortBy, setSortBy] = useState<SortableColumns>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [isDataLoading, startTransition] = useTransition();

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  const fetchUsers = useCallback(() => {
    startTransition(async () => {
      const { users: fetchedUsers, total } = await getUsers({ page, pageSize: PAGE_SIZE, query, role, level, sortBy, sortDirection });
      setUsers(fetchedUsers);
      setTotalUsers(total);
    });
  }, [page, query, role, level, sortBy, sortDirection]);

  // Este efecto se ejecuta cada vez que cambian los filtros, la paginación o el ordenamiento.
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setPage(1); // Reset page on new search
  };
  
  const handleRoleChange = (newRole: typeof role) => {
    setRole(newRole);
    setPage(1);
  };
  
  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    setPage(1);
  };
  
  const handleSort = (column: SortableColumns) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  const renderSortArrow = (column: SortableColumns) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    return sortDirection === 'desc' ? '▼' : '▲';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>Visualiza, filtra y gestiona los usuarios de la plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <Input 
            placeholder="Buscar por nombre o email..." 
            value={query} 
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Rol: {role === 'all' ? 'Todos' : role}</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleRoleChange('all')}>Todos</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRoleChange('client')}>Clientes</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRoleChange('professional')}>Profesionales</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRoleChange('admin')}>Admins</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Nivel: {level === 0 ? 'Todos' : level}</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleLevelChange(0)}>Todos</DropdownMenuItem>
              {[1, 2, 3, 4, 5].map(l => (
                <DropdownMenuItem key={l} onSelect={() => handleLevelChange(l)}>Nivel {l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Button variant="ghost" onClick={() => handleSort('name')}>Nombre {renderSortArrow('name')}</Button></TableHead>
              <TableHead>Rol</TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('loyaltyPoints')}>Puntos {renderSortArrow('loyaltyPoints')}</Button></TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead><Button variant="ghost" onClick={() => handleSort('createdAt')}>Miembro desde {renderSortArrow('createdAt')}</Button></TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isDataLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={`loading-user-${i}`} />)
            ) : users.length > 0 ? (
              users.map(user => {
                const userLevel = getUserLevel(user.loyaltyPoints);
                return (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                        {user.isAdmin ? <Badge variant="destructive">Admin</Badge> 
                        : user.isProfessional ? <Badge variant="secondary">Profesional</Badge>
                        : <Badge>Cliente</Badge>}
                    </TableCell>
                    <TableCell>{user.loyaltyPoints}</TableCell>
                    <TableCell>{userLevel.name} (Nivel {userLevel.level})</TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'dd MMM, yyyy', { locale: es })}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center">No se encontraron usuarios.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">Página {page} de {totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1 || isDataLoading}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages || isDataLoading}>Siguiente</Button>
        </div>
      </CardContent>
    </Card>
  );
}
