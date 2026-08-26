import Header from '../components/header';
import Footer from '../components/footer';
import Login from '../components/auth/Login';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Header />
      <main className="flex-1">
        <Login />
      </main>
      <Footer />
    </div>
  );
}
