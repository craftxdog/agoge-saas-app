import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export const ChartCard = ({
  title,
  description,
  children,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
};
