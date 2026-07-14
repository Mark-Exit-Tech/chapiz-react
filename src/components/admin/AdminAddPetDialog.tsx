import { FormEvent, useState } from 'react';
import { ImagePlus, Loader2, Plus } from 'lucide-react';
import { createPetInFirestore, type Pet } from '@/lib/firebase/database/pets';
import { uploadPetImage } from '@/lib/firebase/storage';
import { validateImageFile } from '@/lib/validation/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminAddPetDialogProps {
  owner: { uid: string; email: string };
  onCreated: (pet: Pet) => void;
}

export default function AdminAddPetDialog({ owner, onCreated }: AdminAddPetDialogProps) {
  const locale = window.location.pathname.split('/')[1] === 'he' ? 'he' : 'en';
  const isHebrew = locale === 'he';
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const emptyForm = { name: '', type: 'dog', breedName: '', gender: '', birthDate: '', weight: '', notes: '', imageUrl: '', isLost: true };
  const [form, setForm] = useState(emptyForm);

  const text = {
    add: isHebrew ? 'הוסף חיית מחמד' : 'Add pet',
    title: isHebrew ? 'הוספת חיית מחמד למשתמש' : 'Add a pet for this user',
    name: isHebrew ? 'שם' : 'Name',
    type: isHebrew ? 'סוג' : 'Type',
    breed: isHebrew ? 'גזע' : 'Breed',
    gender: isHebrew ? 'מין' : 'Gender',
    selectGender: isHebrew ? 'בחר מין' : 'Select gender',
    male: isHebrew ? 'זכר' : 'Male',
    female: isHebrew ? 'נקבה' : 'Female',
    unknown: isHebrew ? 'לא ידוע' : 'Unknown',
    birthDate: isHebrew ? 'תאריך לידה' : 'Birth date',
    weight: isHebrew ? 'משקל (ק״ג)' : 'Weight (kg)',
    notes: isHebrew ? 'הערות' : 'Notes',
    lost: isHebrew ? 'חיית המחמד אבודה' : 'Pet is lost',
    lostHelp: isHebrew ? 'הפרופיל יהיה גלוי בעת סריקת התג.' : 'The profile will be visible when the tag is scanned.',
    image: isHebrew ? 'תמונת חיית המחמד' : 'Pet image',
    chooseImage: isHebrew ? 'בחר תמונה' : 'Choose image',
    uploading: isHebrew ? 'מעלה תמונה...' : 'Uploading image...',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    saving: isHebrew ? 'שומר...' : 'Saving...',
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const validation = validateImageFile(file, {
      errors: isHebrew ? {
        noFile: 'יש לבחור תמונה',
        type: 'ניתן להעלות JPG, PNG, GIF או WebP בלבד',
        size: 'התמונה גדולה מדי. הגודל המרבי הוא 10MB',
      } : undefined,
    });

    if (!validation.valid || !file) {
      setImageError(validation.error || 'Invalid image');
      event.target.value = '';
      return;
    }

    setUploading(true);
    setError('');
    setImageError('');
    const result = await uploadPetImage(file, owner.uid);
    if (!result.success || !result.downloadURL) {
      setImageError(result.error || (isHebrew ? 'העלאת התמונה נכשלה' : 'Image upload failed'));
    } else {
      setForm((current) => ({ ...current, imageUrl: result.downloadURL || '' }));
      setImageError('');
    }
    setUploading(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (!form.imageUrl) {
      setImageError(isHebrew ? 'יש להעלות תמונה של חיית המחמד' : 'Please upload a pet image');
      return;
    }

    setSubmitting(true);
    setError('');
    const result = await createPetInFirestore({
      name: form.name.trim(),
      type: form.type,
      breedName: form.breedName.trim(),
      breed: form.breedName.trim(),
      gender: form.gender,
      genderId: form.gender === 'male' ? 1 : form.gender === 'female' ? 2 : 0,
      birthDate: form.birthDate,
      weight: form.weight,
      notes: form.notes.trim(),
      imageUrl: form.imageUrl.trim(),
      userEmail: owner.email,
      ownerId: owner.uid,
      isLost: form.isLost,
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
      genderId: form.gender === 'male' ? 1 : form.gender === 'female' ? 2 : 0,
      breedId: 0,
      isLost: form.isLost,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setForm(emptyForm);
    setSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="me-2 h-4 w-4" />{text.add}</Button>
      </DialogTrigger>
      <DialogContent dir={isHebrew ? 'rtl' : 'ltr'} className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{text.title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="admin-pet-name">{text.name}</Label><Input id="admin-pet-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="admin-pet-type">{text.type}</Label><select id="admin-pet-type" className="h-10 w-full rounded-md border bg-white px-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option></select></div>
          <div className="space-y-2"><Label htmlFor="admin-pet-breed">{text.breed}</Label><Input id="admin-pet-breed" value={form.breedName} onChange={(e) => setForm({ ...form, breedName: e.target.value })} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-pet-gender">{text.gender}</Label>
              <select id="admin-pet-gender" className="h-10 w-full rounded-md border bg-white px-3" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">{text.selectGender}</option><option value="male">{text.male}</option><option value="female">{text.female}</option><option value="unknown">{text.unknown}</option>
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="admin-pet-birth-date">{text.birthDate}</Label><Input id="admin-pet-birth-date" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="admin-pet-weight">{text.weight}</Label><Input id="admin-pet-weight" type="number" min="0" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="admin-pet-notes">{text.notes}</Label><Textarea id="admin-pet-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="space-y-2">
            <Label htmlFor="admin-pet-image">{text.image}</Label>
            {form.imageUrl ? <img src={form.imageUrl} alt="" className="h-28 w-28 rounded-lg border object-cover" /> : null}
            <Label htmlFor="admin-pet-image" className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-4 hover:bg-gray-50 ${imageError ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {uploading ? text.uploading : text.chooseImage}
            </Label>
            <Input id="admin-pet-image" className="sr-only" type="file" accept="image/jpeg,image/png,image/gif,image/webp" aria-invalid={Boolean(imageError)} aria-describedby={imageError ? 'admin-pet-image-error' : undefined} onChange={handleImageChange} disabled={uploading} />
            {imageError ? <p id="admin-pet-image-error" role="alert" className="text-sm font-medium text-red-600">{imageError}</p> : null}
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox id="admin-pet-lost" checked={form.isLost} onCheckedChange={(checked) => setForm({ ...form, isLost: checked === true })} />
            <div><Label htmlFor="admin-pet-lost" className="cursor-pointer">{text.lost}</Label><p className="mt-1 text-xs text-gray-500">{text.lostHelp}</p></div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>{text.cancel}</Button><Button type="submit" disabled={submitting || uploading}>{submitting ? text.saving : text.add}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
