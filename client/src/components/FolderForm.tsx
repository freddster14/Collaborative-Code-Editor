// export default function FolderForm() {


//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       const res = await postRequest("/doc", { name, folderId });
//       navigate(`/dashboard/edit/${res.id}`)
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsSubmitting(false)
//     }
//   };
//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input type="text" />
//       </form>
//     </div>
//   )
// }