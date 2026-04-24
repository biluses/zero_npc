import { redirect } from 'next/navigation';

// /home era el dashboard del MVP previo. Tras adoptar el diseño XD, "Yo"
// (perfil) es la pantalla principal. Mantenemos esta ruta como redirect
// para no romper enlaces antiguos.
export default function HomeRedirect() {
  redirect('/profile');
}
