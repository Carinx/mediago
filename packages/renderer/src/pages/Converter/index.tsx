import React, { ReactNode, useState } from "react";
import PageContainer from "../../components/PageContainer";
import { useTranslation } from "react-i18next";
import { Button, Space, message } from "antd";
import useElectron from "../../hooks/electron";
import { ProList } from "@ant-design/pro-components";
import { usePagination } from "ahooks";
import { getFileName } from "../../utils";
import { Conversion } from "../../../../main/types/entity/Conversion";
import { DeleteOutlined, SyncOutlined } from "@ant-design/icons";
import { produce } from "immer";

const Converter = () => {
  const { t } = useTranslation();
  const {
    selectFile,
    getConversions,
    addConversion,
    convertToAudio,
    deleteConversion,
  } = useElectron();
  const [messageApi, contextHolder] = message.useMessage();
  const [converting, setConverting] = useState<Record<number, boolean>>({});

  const {
    data = { total: 0, list: [] },
    loading,
    pagination,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      return getConversions({
        current,
        pageSize,
      });
    },
    {
      defaultPageSize: 50,
      refreshDeps: [],
    }
  );

  const onClickConvertToAudio = async (item: Conversion) => {
    const nextState = produce((draft) => {
      draft[item.id] = true;
    });
    setConverting(nextState);
    try {
      await convertToAudio(item.id);
      messageApi.success(t("convertSuccess"));
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      const nextState = produce((draft) => {
        draft[item.id] = false;
      });
      setConverting(nextState);
    }
  };

  const onDeleteConversion = async (id: number) => {
    await deleteConversion(id);
    refresh();
  };

  const renderActionButtons = (dom: ReactNode, item: Conversion): ReactNode => {
    // 下载成功
    return [
      <Button
        type="text"
        key="restart"
        icon={<SyncOutlined spin={converting[item.id]} />}
        title={t("convertToAudio")}
        onClick={() => onClickConvertToAudio(item)}
      />,
      <Button
        type="text"
        key="restart"
        icon={<DeleteOutlined />}
        title={t("delete")}
        onClick={() => onDeleteConversion(item.id)}
      />,
    ];
  };

  return (
    <PageContainer
      title={t("converter")}
      rightExtra={
        <Space>
          <Button
            onClick={async () => {
              const file = await selectFile();
              await addConversion({
                name: getFileName(file),
                path: file,
              });
              refresh();
            }}
          >
            {t("addFile")}
          </Button>
        </Space>
      }
    >
      {contextHolder}
      <ProList<Conversion>
        loading={loading}
        className="download-list"
        pagination={pagination}
        metas={{
          title: {
            render: (text, record) => {
              return record.name;
            },
          },
          description: {
            render: (text, record) => {
              return record.path;
            },
          },
          actions: {
            render: renderActionButtons,
          },
        }}
        rowKey="id"
        dataSource={data.list}
      />
    </PageContainer>
  );
};

export default Converter;
