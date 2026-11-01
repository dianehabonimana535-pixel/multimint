import TokenCreatorForm from "@/components/TokenCreatorForm";
import Footer from "@/components/Footer";
import CreateIntro from "@/components/CreateIntro";

export default function CreatePage() {
  return (
    <main>
      <div className="container py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Create your token</h1>
          <CreateIntro />
        </div>
        <TokenCreatorForm />
      </div>
      <Footer />
    </main>
  );
}
