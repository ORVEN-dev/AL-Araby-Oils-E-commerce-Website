import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const questions = [
  ["Where can I find a product?", "Search by name, category or a word in the description. Filters narrow the current results. Use Clear filters to return to the full catalogue."],
  ["How does the cart work?", "You can add items, change quantities and remove them. The cart is stored in this browser and prices are read from the sample catalogue."],
  ["Can I buy or pay for products?", "Checkout shows a sample summary. It does not place an order, take a payment or arrange shipping."],
  ["Where do my saved products go?", "Products you save are available in Saved Products on this browser. No account is needed."],
  ["Can I send a message or sign up?", "This concept has no storefront contact form, mailing list or account registration."],
];

export default function FAQ() {
  return <section className="container mx-auto max-w-3xl px-4 py-14">
    <h1 className="text-4xl font-bold">Demo FAQ</h1>
    <Accordion type="single" collapsible className="my-7">
      {questions.map(([question, answer]) => <AccordionItem key={question} value={question}>
        <AccordionTrigger className="text-left">{question}</AccordionTrigger>
        <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
      </AccordionItem>)}
    </Accordion>
    <Link className="font-medium text-primary underline" to="/about">About this demo and browser storage</Link>
  </section>;
}
