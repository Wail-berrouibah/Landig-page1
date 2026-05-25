import Hero from "@/components/hero";
import SpecsTable from "@/components/specs-table";
import WhyThisModel from "@/components/why-this-model";
import OrderForm from "@/components/order-form";
import FAQ from "@/components/faq";
import StickyCTA from "@/components/sticky-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <SpecsTable />
      <WhyThisModel />
      <OrderForm />
      <FAQ />
      <StickyCTA />
    </>
  );
}
