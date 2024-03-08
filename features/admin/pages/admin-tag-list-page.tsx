'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatToDateTime } from '@/utils/time';

import { getTags } from '@/features/tag';

import { CreateTagButton } from '../components/create-tag-button';
import { DeleteTagButton } from '../components/delete-tag-button';
import { EditTagButton } from '../components/edit-tag-button';

export const AdminTagListPage = () => {
  const { data } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        标签管理
      </h2>
      <div className="flex justify-end">
        <CreateTagButton />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>slug</TableHead>
            <TableHead>文章数</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.tags?.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="!align-middle">{tag.name}</TableCell>
              <TableCell className="!align-middle">{tag.slug}</TableCell>
              <TableCell className="!align-middle">
                {tag._count?.articles ?? 0}
              </TableCell>
              <TableCell className="!align-middle">
                {formatToDateTime(tag.createdAt)}
              </TableCell>
              <TableCell className="!align-middle">
                {formatToDateTime(tag.updatedAt)}
              </TableCell>
              <TableCell className="!align-middle !h-rx-9">
                <div className="flex gap-2 items-center">
                  <EditTagButton tag={tag} />
                  <DeleteTagButton tag={tag} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
