import Link from "next/link";

const FooterLink = ({ href, linkText, text }: FooterLinkProps) => {
  return (
    <div className="text-center text-sm text-gray-500 mt-8 mb-4">
      <span> {text}</span>
      <Link href={href} className="text-yellow-400 hover:underline ml-1">
        {linkText}
      </Link>
    </div>
  );
};
export default FooterLink;
