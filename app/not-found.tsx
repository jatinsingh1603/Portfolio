import { Button, Container } from "@/components/primitives";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[70vh] items-center">
      <Container width="default">
        <p className="t-label">404</p>
        <h1 className="t-h1 mt-5">Station not found.</h1>
        <p className="t-lede mt-5">
          The page you asked for isn&rsquo;t part of this site&mdash;pick a way
          back below.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button href="/" className="w-full sm:w-auto">
            Back to the start
          </Button>
          <Button href="/security" variant="ghost" className="w-full sm:w-auto">
            Disclosure record
          </Button>
        </div>
      </Container>
    </main>
  );
}
