// import React from 'react'

// const CareerPost = () => {
//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6 border border-gray-200">
//       {/* Job Title & Type */}
//       <div>
//         <h2 className="text-2xl font-bold text-gray-800">Node Js Developer</h2>
//         <p className="text-sm text-gray-500">Full Time</p>
//       </div>

//       {/* Key Info: Experience, Department, Location */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
//         <div>
//           <span className="font-semibold text-gray-800">Experience:</span>{" "}
//           1 yr - 3 yr
//         </div>
//         <div>
//           <span className="font-semibold text-gray-800">Department:</span>{" "}
//           Development
//         </div>
//         <div>
//           <span className="font-semibold text-gray-800">Location:</span> Pune
//         </div>
//       </div>

//       {/* Description */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-800 mb-1">Description</h3>
//         <p className="text-gray-700">
//           We are looking for a skilled Node Js Developer to contribute to our
//           team's success. The ideal candidate will have solid experience and the
//           ability to work independently on complex tasks.
//         </p>
//       </div>

//       {/* Requirements */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-800 mb-2">Requirements</h3>
//         <ul className="list-disc list-inside text-gray-700 space-y-1">
//           <li>3-5 years of relevant experience</li>
//           <li>Strong node js developer skills</li>
//           <li>Good communication abilities</li>
//           <li>Problem-solving mindset</li>
//           <li>Bachelor's degree in relevant field</li>
//         </ul>
//       </div>

//       {/* Responsibilities */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-800 mb-2">Responsibilities</h3>
//         <ul className="list-disc list-inside text-gray-700 space-y-1">
//           <li>Develop and maintain solutions</li>
//           <li>Collaborate with team members</li>
//           <li>Participate in code reviews</li>
//           <li>Write node js developer documentation</li>
//           <li>Support junior team members</li>
//         </ul>
//       </div>

//       {/* Required Skills */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-800 mb-2">Required Skills</h3>
//         <div className="flex flex-wrap gap-2">
//           {[
//             "Problem Solving",
//             "Team Collaboration",
//             "Node Js Developer Design",
//             "Code Review",
//             "Documentation",
//             "Testing",
//           ].map((skill) => (
//             <span
//               key={skill}
//               className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
//             >
//               {skill}
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CareerPost
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import React from "react";
import { useParams } from "react-router-dom";

const CareerPost: React.FC = () => {
  const { id } = useParams();
  const { getJobByIdFromCache } = useJobs();
  const { organizations } = useOrganizations();
  const selectedJob = getJobByIdFromCache(id);
  console.log(selectedJob, organizations);
  const ownOrg = organizations?.filter((org) => org.is_own_org) || [];
  console.log(ownOrg);
  if (!selectedJob) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Loading or job not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6 border border-gray-200">
      {/* Job Title & Type */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedJob.title}{ownOrg[0]?.name && ` - ${ownOrg[0].name}` || ""}
        </h2>
        <p className="text-sm text-gray-500">{selectedJob.type}</p>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div>
          <span className="font-semibold text-gray-800">Experience:</span>{" "}
          {selectedJob.experience_min} yr -{selectedJob.experience_max} yr
        </div>
        <div>
          <span className="font-semibold text-gray-800">Department:</span>{" "}
          {selectedJob.department}
        </div>
        <div>
          <span className="font-semibold text-gray-800">Location:</span>{" "}
          {selectedJob.location}
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Description
        </h3>
        <p className="text-gray-700">{selectedJob.description}</p>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Requirements
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {selectedJob.requirements.map((req, idx) => (
            <li key={idx}>{req}</li>
          ))}
        </ul>
      </div>

      {/* Responsibilities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Responsibilities
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {selectedJob.responsibilities.map((res, idx) => (
            <li key={idx}>{res}</li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Required Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedJob.skills.map((skill, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <p className="text-gray-700">Apply on {ownOrg[0]?.email_domain && ` - ${ownOrg[0].email_domain}` || ""}</p>
    </div>
  );
};

export default CareerPost;
