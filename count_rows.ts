import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';
const projectId = 'alien-craft-468804-c6';
const keyFilename = path.join(process.cwd(), 'service-account.json');
const bigquery = new BigQuery({ projectId, keyFilename });
async function countRows() {
  const [job] = await bigquery.createQueryJob({ query: 'SELECT COUNT(*) as c FROM `alien-craft-468804-c6.mimic_extract.vitals`' });
  const [rows] = await job.getQueryResults();
  console.log('Count:', rows[0]);
}
countRows();
