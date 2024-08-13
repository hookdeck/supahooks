export default function ErrorPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      <p>Sorry, something went wrong</p>
      {searchParams["message"] && <p>{searchParams["message"]}</p>}
    </>
  );
}
