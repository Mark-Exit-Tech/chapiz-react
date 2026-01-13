'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser, type User } from '@/lib/firebase/database/users';
import { getPetsByUserEmail, type Pet } from '@/lib/firebase/database/pets';
import { Trash2, Edit2, Users, Shield, ShieldAlert, Eye, PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import AddUserForm from '@/components/admin/AddUserForm';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול משתמשים' : 'Users Management',
    description: isHebrew ? 'נהלו וערכו את כל המשתמשים בפלטפורמה' : 'Manage and edit all users on the platform',
    loading: isHebrew ? 'טוען...' : 'Loading...',
    noUsers: isHebrew ? 'לא נמצאו משתמשים' : 'No users found',
    name: isHebrew ? 'שם' : 'Name',
    email: isHebrew ? 'אימייל' : 'Email',
    role: isHebrew ? 'תפקיד' : 'Role',
    phone: isHebrew ? 'טלפון' : 'Phone',
    created: isHebrew ? 'נוצר' : 'Created',
    actions: isHebrew ? 'פעולות' : 'Actions',
    admin: isHebrew ? 'מנהל' : 'Admin',
    superAdmin: isHebrew ? 'מנהל על' : 'Super Admin',
    user: isHebrew ? 'משתמש' : 'User',
    restricted: isHebrew ? 'מוגבל' : 'Restricted',
    delete: isHebrew ? 'מחק' : 'Delete',
    edit: isHebrew ? 'ערוך' : 'Edit',
    view: isHebrew ? 'צפה' : 'View',
    totalUsers: isHebrew ? 'סה"כ משתמשים' : 'Total Users',
    deleteConfirm: isHebrew ? 'האם אתה בטוח שברצונך למחוק משתמש זה?' : 'Are you sure you want to delete this user?',
    deleteSuccess: isHebrew ? 'המשתמש נמחק בהצלחה' : 'User deleted successfully',
    deleteFailed: isHebrew ? 'נכשל במחיקת המשתמש' : 'Failed to delete user',
    userDetails: isHebrew ? 'פרטי משתמש' : 'User Details',
    userPets: isHebrew ? 'חיות המחמד של המשתמש' : "User's Pets",
    noPets: isHebrew ? 'אין חיות מחמד' : 'No pets',
    loadingPets: isHebrew ? 'טוען חיות מחמד...' : 'Loading pets...',
    petName: isHebrew ? 'שם' : 'Name',
    petType: isHebrew ? 'סוג' : 'Type',
    breed: isHebrew ? 'גזע' : 'Breed'
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm(text.deleteConfirm)) {
      return;
    }

    try {
      await deleteUser(uid);
      alert(text.deleteSuccess);
      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(text.deleteFailed);
    }
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setLoadingPets(true);
    try {
      const pets = await getPetsByUserEmail(user.email);
      setUserPets(pets);
    } catch (error) {
      console.error('Error loading pets:', error);
      setUserPets([]);
    } finally {
      setLoadingPets(false);
    }
  };

  const getRoleBadge = (role: string, isRestricted?: boolean) => {
    if (isRestricted) {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          {text.restricted}
        </Badge>
      );
    }

    const roleConfig: Record<string, { label: string; className: string }> = {
      super_admin: { label: text.superAdmin, className: 'bg-purple-100 text-purple-800' },
      admin: { label: text.admin, className: 'bg-blue-100 text-blue-800' },
      user: { label: text.user, className: 'bg-gray-100 text-gray-800' }
    };

    const config = roleConfig[role] || roleConfig.user;
    return (
      <Badge className={config.className + " flex items-center gap-1"}>
        <Shield className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    
    try {
      // Handle Date object or timestamp
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'object' && 'toDate' in date) {
        // Firestore Timestamp
        dateObj = (date as any).toDate();
      } else {
        dateObj = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
        return '-';
      }
      
      return new Intl.DateTimeFormat(isHebrew ? 'he-IL' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return '-';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-gray-600">{text.loading}</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="text-left rtl:text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8" />
              {text.title}
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              {text.description}
            </p>
            <div className="mt-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {text.totalUsers}: {users.length}
              </Badge>
            </div>
          </div>
          <div>
            <AddUserForm />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{text.noUsers}</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{text.name}</TableHead>
                    <TableHead>{text.email}</TableHead>
                    <TableHead>{text.phone}</TableHead>
                    <TableHead>{text.role}</TableHead>
                    <TableHead>{text.created}</TableHead>
                    <TableHead className="w-[100px]">{text.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.profileImage || user.profile_image ? (
                            <img 
                              src={user.profileImage || user.profile_image} 
                              alt={user.displayName || user.display_name || text.user}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <span>{user.displayName || user.display_name || user.full_name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role, user.is_restricted)}</TableCell>
                      <TableCell>{formatDate(user.createdAt || user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title={text.view}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.uid)}
                            className="text-red-600 hover:text-red-900"
                            title={text.delete}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{text.userDetails}</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                {selectedUser.profileImage || selectedUser.profile_image ? (
                  <img 
                    src={selectedUser.profileImage || selectedUser.profile_image} 
                    alt={selectedUser.displayName || text.user}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.displayName || selectedUser.display_name || '-'}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  {selectedUser.phone && <p className="text-gray-500 text-sm">{selectedUser.phone}</p>}
                </div>
              </div>

              {/* Role Badge */}
              <div>
                {getRoleBadge(selectedUser.role, selectedUser.is_restricted)}
              </div>

              {/* User's Pets */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <PawPrint className="w-5 h-5" />
                  {text.userPets}
                </h4>
                
                {loadingPets ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">{text.loadingPets}</p>
                  </div>
                ) : userPets.length === 0 ? (
                  <div className="text-center py-8">
                    <PawPrint className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">{text.noPets}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPets.map((pet) => (
                      <div key={pet.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          {pet.imageUrl ? (
                            <img 
                              src={pet.imageUrl} 
                              alt={pet.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <PawPrint className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h5 className="font-semibold">{pet.name}</h5>
                            <p className="text-sm text-gray-600">{pet.breedName || pet.breed || '-'}</p>
                            {pet.description && <p className="text-xs text-gray-500">{pet.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}
