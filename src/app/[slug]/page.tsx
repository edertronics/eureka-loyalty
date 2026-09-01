/* ── ¿EXISTE ESTE NEGOCIO? SE PREGUNTA EN EL SERVIDOR ──────────────
   `[slug]` está en la raíz de la app, así que atrapa CUALQUIER URL que
   no coincida con otra ruta: /precios, /contacto, /lo-que-sea. Antes
   todas ellas respondían HTTP 200 y luego, ya en el navegador, la
   tarjeta pintaba "Negocio no encontrado". Para una persona da igual;
   para Google es una página que existe y está vacía, y acaba indexando
   basura.

   La comprobación tiene que ocurrir ANTES de responder, y por eso esta
   envoltura es un componente de servidor. Lo único que hace es
   preguntar si el slug existe; si no, `notFound()` corta el render y
   devuelve el 404 de verdad. Si existe, monta la tarjeta tal cual.

   Deliberadamente NO se tocó `tarjeta.tsx` (419 líneas, la página que
   usan a diario los clientes de los negocios): sigue haciendo su propia
   consulta y su propio render, exactamente igual que antes. El costo de
   esto es una consulta extra por visita, pidiendo una sola columna. */
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Tarjeta from './tarjeta'

export default async function Page(props: PageProps<'/[slug]'>) {
  const { slug } = await props.params

  const { data, error } = await supabaseAdmin
    .from('businesses')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  /* Si Supabase falla, NO se manda un 404: sería decir "este negocio no
     existe" cuando lo que pasó es que la base no contestó. Ante la duda
     se monta la tarjeta, que ya sabe manejar su propio error. */
  if (!error && !data) notFound()

  return <Tarjeta />
}
