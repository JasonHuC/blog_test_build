import { Heading, Table } from '@radix-ui/themes';

import { CreateTagButton } from './create-tag-button';
import { DeleteTagItemButton } from './delete-tag-item-button';
import { EditTagButton } from './edit-tag-button';
import { getTags } from '@/app/_actions/tag';
import { Pagination } from '@/components/client/pagination/pagination';
import { DEFAULT_PAGE } from '@/constants';
import { formatToDate } from '@/utils';

export default async function AdminTag({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const { tags, total } = await getTags({
    page: currentPage,
  });

  return (
    <div className="flex flex-col gap-4">
      <Heading size={'6'} as="h4">
        标签管理
      </Heading>
      <div className="flex justify-end">
        <CreateTagButton />
      </div>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>名称</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>friendly_url</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>文章数</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>创建时间</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>更新时间</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tags?.map((tag) => (
            <Table.Row key={tag.id}>
              <Table.Cell className="!align-middle">{tag.name}</Table.Cell>
              <Table.Cell className="!align-middle">
                {tag.friendlyUrl}
              </Table.Cell>
              <Table.Cell className="!align-middle">
                {tag.articles?.length ?? 0}
              </Table.Cell>
              <Table.Cell className="!align-middle">
                {formatToDate(new Date(tag.createdAt))}
              </Table.Cell>
              <Table.Cell className="!align-middle">
                {formatToDate(new Date(tag.updatedAt))}
              </Table.Cell>
              <Table.Cell className="!align-middle !h-rx-9">
                <div className="flex gap-2 items-center">
                  <EditTagButton tag={tag} />
                  <DeleteTagItemButton tag={tag} />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Pagination total={total} />
    </div>
  );
}
