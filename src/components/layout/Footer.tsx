const Footer = () => (
  <footer className="border-t py-8 mt-16">
    <div className="container text-center text-sm text-muted-foreground">
      <p className="font-heading text-foreground font-bold text-lg mb-2">
        TRENCHES<span className="text-primary"> MEALS</span>
      </p>
      <p>Good food, no wahala. &copy; {new Date().getFullYear()}</p>
    </div>
  </footer>
);

export default Footer;
