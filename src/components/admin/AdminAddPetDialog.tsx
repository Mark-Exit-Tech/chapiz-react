import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { createPetInFirestore, type Pet } from '@/lib/firebase/database/pets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminAddPetDialogProps {
  owner: { uid: string; email: string };
  onCreated: (pet: Pet) => void;
}

export default function AdminAddPetDialog({ owner, onCreated }: AdminAddPetDialogProps) {
  const locale = window.location.pathname.split('/')[1] === 'he' ? 'he' : 'en';
  const isHebrew = locale === 'he';
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', type: 'dog', breedName: '', imageUrl: '' });

  const text = {
    add: isHebrew ? 'הוסף חיית מחמד' : 'Add pet',
    title: isHebrew ? 'הוספת חיית מחמד למשתמש' : 'Add a pet for this user',
    name: isHebrew ? 'שם' : 'Name',
    type: isHebrew ? 'סוג' : 'Type',
    breed: isHebrew ? 'גזע' : 'Breed',
    image: isHebrew ? 'כתובת תמונה (אופציונלי)' : 'Image URL (optional)',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    saving: isHebrew ? 'שומר...' : 'Saving...',
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    setError('');
    const result = await createPetInFirestore({
      name: form.name.trim(),
      type: form.type,
      breedName: form.breedName.trim(),
      breed: form.breedName.trim(),
      imageUrl: form.imageUrl.trim(),
      userEmail: owner.email,
      ownerId: owner.uid,
      genderId: 1,
      isLost: false,
    });

    if (!result.success || !result.petId) {
      setError(result.error || (isHebrew ? 'לא ניתן להוסיף את חיית המחמד' : 'Could not add pet'));
      setSubmitting(false);
      return;
    }

    onCreated({
      id: result.petId,
      ...form,
      userEmail: owner.email,
      ownerId: owner.uid,
      imageUrl: form.imageUrl.trim(),
      genderId: 1,
      breedId: 0,
      isLost: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setForm({ name: '', type: 'dog', breedName: '', imageUrl: '' });
    setSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="me-2 h-4 w-4" />{text.add}</Button>
      </DialogTrigger>
      <DialogContent dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader><DialogTitle>{text.title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="admin-pet-name">{text.name}</Label><Input id="admin-pet-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="admin-pet-type">{text.type}</Label><select id="admin-pet-type" className="h-10 w-full rounded-md border bg-white px-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option></select></div>
          <div className="space-y-2"><Label htmlFor="admin-pet-breed">{text.breed}</Label><Input id="admin-pet-breed" value={form.breedName} onChange={(e) => setForm({ ...form, breedName: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="admin-pet-image">{text.image}</Label><Input id="admin-pet-image" type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>{text.cancel}</Button><Button type="submit" disabled={submitting}>{submitting ? text.saving : text.add}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
