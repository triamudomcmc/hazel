import { Runtime } from '@lib'
import { StatsSnippet } from 'snippets/studentstats'
import { ClubSnippet } from 'snippets/clubsstats'
import { StudentInfoSnippet } from 'snippets/studentstatus'

enum SnippetMode {
  Stats = 1,
  StudentInfo = 2,
  Club = 3
}

const mode: SnippetMode = SnippetMode.StudentInfo;

switch (mode) {
  case SnippetMode.Stats as number:
    new Runtime('PROD').runSnippet(StatsSnippet)
    break
  case SnippetMode.StudentInfo as number:
    new Runtime('PROD').runSnippet(StudentInfoSnippet)
    break;
  case SnippetMode.Club as number:
    new Runtime('PROD').runSnippet(ClubSnippet)
    break
  default:
    console.log('Invalid mode')
}
