import * as academicPeriodRepository from "../repository/academicPeriod.repository";

export async function getCurrentOrLastActiveAcademicPeriod() {
  let academicPeriod =
    await academicPeriodRepository.getCurrentAcademicPeriod();
  if (!academicPeriod) {
    academicPeriod =
      await academicPeriodRepository.getLastActiveAcademicPeriod();
  }
  return academicPeriod;
}
