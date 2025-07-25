"use client";

import {
  Error,
  ErrorDescription,
  ErrorIcon,
  ErrorTitle,
} from "@/components/error";
import { IconFolderQuestion } from "@tabler/icons-react";

export default function ErrorPage() {
  return (
    <Error>
      <ErrorIcon>
        <IconFolderQuestion />
      </ErrorIcon>
      <ErrorTitle>We couldn’t find that project</ErrorTitle>
      <ErrorDescription>
        The project you're looking for doesn't exist or may have been removed.
        Please check the URL or return to the dashboard.
      </ErrorDescription>
    </Error>
  );
}
