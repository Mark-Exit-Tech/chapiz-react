import { useParams } from 'react-router-dom';
import TagFoundPage from '@/components/TagFoundPage';

export default function TagFoundRoutePage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <TagFoundPage petId={id} />;
}
