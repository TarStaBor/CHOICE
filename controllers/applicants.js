const Applicant = require("../models/applicant");
// const Job = require("../models/job");
const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const errorMessages = require("../utils/error-messages");
const fs = require("fs");
// возвращает все отклики
const getApplicants = (req, res, next) => {
  Applicant.find()
    .then((jobs) => res.send(jobs))
    .catch(next);
};

// создать отклик
const createApplicant = (req, res, next) => {
  const { date, link, company, jobId } = req.body;
  let resume = "";
  if (req.files) {
    resume = req.files.resume.name;
  }

  const comment = "";

  Applicant.create({
    date,
    link,
    resume: resume,
    job: jobId,
    comment: comment,
    company: company,
  })
    .then((data) => {
      console.log(`./resumes/${company}/${jobId}/${data._id}/${data.resume}`);
      if (data.resume) {
        req.files.resume.mv(
          `./resumes/${company}/${jobId}/${data._id}/${data.resume}`
        );
      }
      res.send({
        title: "Спасибо!",
        subTitle: "Мы получили ваш отклик",
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        // next(new BadRequestError(errorMessages.BadRequestError));
        next(new BadRequestError(err));
      } else {
        next(err);
      }
    });
};

// Получить количество откликов
const getCountOfApplicants = (req, res, next) => {
  const { id } = req.params;
  Applicant.find({ job: id })
    .orFail(new NotFoundError(errorMessages.NotFoundError))
    .then((applicants) => {
      // count = `${applicants.length}`;
      res.send(applicants);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "CastError") {
        next(new BadRequestError(errorMessages.BadRequestUser));
      } else {
        next(err);
      }
    });
};

// удаляет отклики по id вакансии
const deleteApplicants = (req, res, next) => {
  const id = req;
  Applicant.deleteMany({ job: id })
    .then((res) => {
      console.log(res + " все хорошо");
    })
    .catch((err) => {
      console.log(err);
    });
};

// удаляет вакансию по id
const deleteApplicantById = (req, res, next) => {
  const { id } = req.params;
  Applicant.findById(id)
    // .orFail(new NotFoundError(errorMessages.NotFoundError))
    .then((applicant) => {
      console.log(applicant);
      if (applicant.resume) {
        // удаляем папку, содержащуюю документы по откликам на вакансию
        const path = `./resumes/${applicant.company}/${applicant.job}/${id}`;
        fs.rmdirSync(path, { recursive: true });
      }
      return applicant
        .remove()
        .then(res.send({ message: errorMessages.SuccessDelete }));
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError(errorMessages.BadRequestUser));
      } else {
        next(err);
      }
    });
};

// Обновляет комментарий к отклику
const patchApplicantComment = (req, res, next) => {
  const { id } = req.params;
  const { comment } = req.body;
  Applicant.findByIdAndUpdate(id, { comment: comment })
    // .orFail(new NotFoundError(errorMessages.NotFoundError))

    .then(() => {
      res.send(comment);
    })

    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError(errorMessages.BadRequestUser));
      } else {
        next(err);
      }
    });
};

// .orFail(new NotFoundError(errorMessages.NotFoundError))
// .then((job) => {
//   return job
//     .remove()
//     .then(res.send({ message: errorMessages.SuccessDelete }));
// })
// .catch((err) => {
//   if (err.name === "CastError") {
//     next(new BadRequestError(errorMessages.BadRequestUser));
//   } else {
//     next(err);
//   }
// });

// возвращает вакансию по Id
// const getJobById = (req, res, next) => {
//   console.log(req.params.id);
//   Job.findById(req.params.id)
//     .then((job) => res.send(job))
//     .catch(next);
// };

// загружает изображение
// const uploadLogo = (req, res, next) => {
//   try {
//     if (req.file) {
//       res.json(req.file);
//     }
//   } catch (err) {
//     if (err.name === "CastError") {
//       next(new BadRequestError(errorMessages.BadRequestUser));
//     } else {
//       next(err);
//     }
//   }
// };

module.exports = {
  getApplicants,
  createApplicant,
  deleteApplicants,
  deleteApplicantById,
  getCountOfApplicants,
  patchApplicantComment,
};