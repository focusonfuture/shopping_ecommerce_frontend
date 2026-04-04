import { redirect } from 'next/navigation';
export default function SalePage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/products?sort=-base_price&in_stock=true`);
}
