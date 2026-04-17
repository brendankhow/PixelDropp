import { Navbar } from '@/components/store/Navbar';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#1F1F1F] py-8 px-4 text-center">
        <p className="text-sm text-[#6B7280]">
          © PixelDrop · Built for creators
        </p>
      </footer>
    </div>
  );
}
