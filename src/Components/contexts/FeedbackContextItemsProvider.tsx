import { createContext, useMemo, useState } from 'react';
import { TFeedback } from '../../lib/type';
import { useFeedbackItem } from '../../lib/hooks';

type FeedbackContextItemsProviderProps = {
  children: React.ReactNode;
};

type TFeedbackItemsContext = {
  isLoading: boolean;
  feedbackItems: TFeedback[];
  filterFeedbackItem: TFeedback[];
  errorMessage: string;
  companyList: string[];
  handleAddToList: (text: string) => void;
  handleSelectCompany: (company: string) => void;
};

export const FeedbackItemsContext = createContext<TFeedbackItemsContext | null>(
  null
);

export default function FeedbackContextItemsProvider({
  children
}: FeedbackContextItemsProviderProps) {
  const { isLoading, errorMessage, feedbackItems, setFeedbackItems } =
    useFeedbackItem();
  const [selectCompany, setSelectCompany] = useState('');

  const filterFeedbackItem = useMemo(
    () =>
      selectCompany
        ? feedbackItems.filter(
            feedbackItem => feedbackItem.company === selectCompany
          )
        : feedbackItems,
    [feedbackItems, selectCompany]
  );

  const handleSelectCompany = (company: string) => {
    setSelectCompany(company);
  };
  const companyList = useMemo(
    () =>
      feedbackItems
        .map(name => name.company)
        .filter((company, index, array) => {
          return array.indexOf(company) === index;
        }),
    [feedbackItems]
  );
  const handleAddToList = async (text: string) => {
    const companyName = text
      .split(' ')
      .find(word => word.includes('#'))!
      .substring(1);

    const newItem: TFeedback = {
      id: new Date().getTime(),
      company: companyName,
      badgeLetter: companyName.substring(0, 1).toUpperCase(),
      daysAgo: 0,
      upvoteCount: 0,
      text: text
    };
    setFeedbackItems([...feedbackItems, newItem]);

    await fetch(
      'https://bytegrad.com/course-assets/projects/corpcomment/api/feedbacks',
      {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
  };

  return (
    <FeedbackItemsContext.Provider
      value={{
        isLoading,
        errorMessage,
        companyList,
        handleAddToList,
        filterFeedbackItem,
        feedbackItems,
        handleSelectCompany
      }}
    >
      {children}
    </FeedbackItemsContext.Provider>
  );
}
